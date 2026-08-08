import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { User, UserFormValue } from '../models/user';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.reqresApiUrl}/users`;

interface ReqresUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface ReqresUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqresUser[];
}

function toUser(raw: ReqresUser): User {
  return { id: raw.id, email: raw.email, firstName: raw.first_name, lastName: raw.last_name, avatar: raw.avatar };
}

function toReqresBody(value: UserFormValue) {
  return { email: value.email, first_name: value.firstName, last_name: value.lastName, avatar: value.avatar };
}

/**
 * reqres.in's write endpoints don't persist into subsequent GET /users pages, so writes are
 * tracked here and replayed on top of whatever the next GET returns: new users (negative
 * ids) are pinned to the top of page 0, edits/deletes to server-backed ids are re-applied
 * to each freshly fetched page.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly users = signal<User[]>([]);
  private readonly totalCount = signal(0);
  private readonly localCreated = signal<User[]>([]);
  private readonly localUpdates = new Map<number, User>();
  private readonly localDeletes = new Set<number>();
  private nextLocalId = -1;

  readonly list = computed(() => this.users());
  readonly total = computed(() => this.totalCount() + this.localCreated().length);

  constructor(private readonly http: HttpClient) {}

  fetchPage(skip: number, limit: number): Observable<User[]> {
    const page = Math.floor(skip / limit) + 1;
    return this.http.get<ReqresUsersResponse>(`${API_URL}?page=${page}&per_page=${limit}`).pipe(
      tap((res) => this.totalCount.set(res.total)),
      map((res) =>
        res.data
          .map(toUser)
          .filter((u) => !this.localDeletes.has(u.id))
          .map((u) => this.localUpdates.get(u.id) ?? u)
      ),
      map((users) => (skip === 0 ? [...this.localCreated(), ...users] : users)),
      tap((users) => this.users.set(users))
    );
  }

  getById(id: number): User | undefined {
    return this.users().find((u) => u.id === id);
  }

  /** Locally-created users (negative ids) only ever exist in the signal store. */
  fetchOne(id: number): Observable<User | undefined> {
    const cached = this.getById(id);
    if (cached || id < 0) {
      return of(cached);
    }
    return this.http.get<{ data: ReqresUser }>(`${API_URL}/${id}`).pipe(map((res) => toUser(res.data)));
  }

  create(value: UserFormValue): Observable<User> {
    return this.http.post<ReqresUser>(API_URL, toReqresBody(value)).pipe(
      // reqres's mock create doesn't persist into GET /users, so mint a local id to display it.
      map(() => ({ ...value, id: this.nextLocalId-- })),
      tap((user) => {
        this.localCreated.update((list) => [user, ...list]);
        this.users.update((list) => [user, ...list]);
      })
    );
  }

  update(id: number, value: UserFormValue): Observable<User> {
    if (id < 0) {
      const updated: User = { id, email: value.email, firstName: value.firstName, lastName: value.lastName, avatar: value.avatar };
      this.localCreated.update((list) => list.map((u) => (u.id === id ? updated : u)));
      this.users.update((list) => list.map((u) => (u.id === id ? updated : u)));
      return of(updated);
    }

    return this.http.put<ReqresUser>(`${API_URL}/${id}`, toReqresBody(value)).pipe(
      map(() => ({ ...value, id })),
      tap((user) => {
        this.localUpdates.set(id, user);
        this.users.update((list) => list.map((u) => (u.id === id ? user : u)));
      })
    );
  }

  delete(id: number): Observable<void> {
    if (id < 0) {
      this.localCreated.update((list) => list.filter((u) => u.id !== id));
      this.users.update((list) => list.filter((u) => u.id !== id));
      return of(void 0);
    }

    return this.http.delete(`${API_URL}/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.localDeletes.add(id);
        this.localUpdates.delete(id);
        this.users.update((list) => list.filter((u) => u.id !== id));
      })
    );
  }
}
