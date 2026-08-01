import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { User, UserFormValue } from '../models/user';

const API_URL = 'https://dummyjson.com/users';

interface DummyJsonUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

function toUser(raw: DummyJsonUser): User {
  return { id: raw.id, email: raw.email, firstName: raw.firstName, lastName: raw.lastName, avatar: raw.image };
}

/**
 * dummyjson's write endpoints are mocked (nothing persists server-side), so writes are
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
    return this.http.get<DummyJsonUsersResponse>(`${API_URL}?skip=${skip}&limit=${limit}`).pipe(
      tap((res) => this.totalCount.set(res.total)),
      map((res) =>
        res.users
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
    return this.http.get<DummyJsonUser>(`${API_URL}/${id}`).pipe(map(toUser));
  }

  create(value: UserFormValue): Observable<User> {
    return this.http
      .post<DummyJsonUser>(`${API_URL}/add`, {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        image: value.avatar
      })
      .pipe(
        // dummyjson's mock /add always echoes the same id, so mint a local one to avoid collisions.
        map((raw) => ({ ...toUser(raw), id: this.nextLocalId--, avatar: value.avatar || raw.image })),
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

    return this.http
      .put<DummyJsonUser>(`${API_URL}/${id}`, {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        image: value.avatar
      })
      .pipe(
        map((raw) => ({ ...toUser(raw), id, avatar: value.avatar || raw.image })),
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
