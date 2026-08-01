document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('user-table-body');
    const modalOverlay = document.getElementById('user-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('user-form');
    const idInput = document.getElementById('user-id');
    const emailInput = document.getElementById('user-email');
    const firstNameInput = document.getElementById('user-first-name');
    const lastNameInput = document.getElementById('user-last-name');
    const avatarInput = document.getElementById('user-avatar');

    // Dữ liệu mẫu, chỉ lưu trong bộ nhớ trình duyệt (chưa gọi API).
    let users = [
        { id: 1, email: 'george.bluth@reqres.in', firstName: 'George', lastName: 'Bluth', avatar: 'https://reqres.in/img/faces/1-image.jpg' },
        { id: 2, email: 'janet.weaver@reqres.in', firstName: 'Janet', lastName: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' },
        { id: 3, email: 'emma.wong@reqres.in', firstName: 'Emma', lastName: 'Wong', avatar: 'https://reqres.in/img/faces/3-image.jpg' },
        { id: 4, email: 'eve.holt@reqres.in', firstName: 'Eve', lastName: 'Holt', avatar: 'https://reqres.in/img/faces/4-image.jpg' }
    ];
    let nextId = users.length + 1;

    function render() {
        tableBody.innerHTML = '';
        users.forEach((user) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img class="avatar" src="${user.avatar}" alt=""></td>
                <td>${user.email}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td class="row-actions">
                    <button type="button" class="btn-edit" data-id="${user.id}">Sửa</button>
                    <button type="button" class="btn-delete" data-id="${user.id}">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function openModal(user) {
        form.reset();
        clearErrors();
        if (user) {
            modalTitle.textContent = 'Sửa người dùng';
            idInput.value = user.id;
            emailInput.value = user.email;
            firstNameInput.value = user.firstName;
            lastNameInput.value = user.lastName;
            avatarInput.value = user.avatar;
        } else {
            modalTitle.textContent = 'Thêm người dùng';
            idInput.value = '';
        }
        modalOverlay.classList.add('open');
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
    }

    function clearErrors() {
        document.getElementById('user-email-error').textContent = '';
        document.getElementById('user-first-name-error').textContent = '';
        document.getElementById('user-last-name-error').textContent = '';
    }

    function validate() {
        clearErrors();
        let valid = true;

        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            document.getElementById('user-email-error').textContent = 'Email không hợp lệ.';
            valid = false;
        }
        if (!firstNameInput.value.trim()) {
            document.getElementById('user-first-name-error').textContent = 'Vui lòng nhập first name.';
            valid = false;
        }
        if (!lastNameInput.value.trim()) {
            document.getElementById('user-last-name-error').textContent = 'Vui lòng nhập last name.';
            valid = false;
        }

        return valid;
    }

    document.getElementById('btn-add-user').addEventListener('click', () => openModal(null));
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    tableBody.addEventListener('click', (event) => {
        const id = Number(event.target.dataset.id);
        if (!id) return;

        if (event.target.classList.contains('btn-edit')) {
            openModal(users.find((u) => u.id === id));
        } else if (event.target.classList.contains('btn-delete')) {
            if (confirm('Xóa người dùng này?')) {
                users = users.filter((u) => u.id !== id);
                render();
            }
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validate()) return;

        const value = {
            email: emailInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            avatar: avatarInput.value.trim() || 'https://reqres.in/img/faces/7-image.jpg'
        };

        const id = idInput.value ? Number(idInput.value) : null;
        if (id) {
            users = users.map((u) => (u.id === id ? { id, ...value } : u));
        } else {
            users = [...users, { id: nextId++, ...value }];
        }

        closeModal();
        render();
    });

    render();
});
