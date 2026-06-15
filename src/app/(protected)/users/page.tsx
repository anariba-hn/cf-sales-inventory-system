'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/modal';
import { UserForm } from '@/app/components/users/userForm';
import { UserList } from '@/app/components/users/userList';
import { getUsersAction } from '@/actions/user';
import { getSessionAction } from '@/actions/auth';
import { User } from '@/models/user.model';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([getUsersAction(), getSessionAction()]).then(([data, session]) => {
      setUsers(data);
      if (session) setCurrentUserId(session.userId);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          + Nuevo usuario
        </button>
      </div>

      <UserList
        users={users}
        currentUserId={currentUserId}
        onDelete={(id) => setUsers((prev) => prev.filter((u) => u.id !== id))}
      />

      {showModal && (
        <Modal title="Nuevo usuario" onClose={() => setShowModal(false)}>
          <UserForm
            onCreate={(u) => {
              setUsers((prev) => [...prev, u]);
              setShowModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
