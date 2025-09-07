import React, { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useAdmin';
import { User } from '../../services/authService';
import { Plus, Edit, Trash, X } from 'lucide-react';
import UserForm, { UserFormInputs } from './UserForm';

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const openModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (data: any) => { // UserFormInputs
    if (editingUser) {
      // update user
      updateUserMutation.mutate({ id: editingUser.id_agent, payload: data }, {
        onSuccess: closeModal,
      });
    } else {
      // create user
      createUserMutation.mutate(data, {
        onSuccess: closeModal,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">User Management</h3>
        <button onClick={() => openModal()} className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} className="mr-1" /> Add User
        </button>
      </div>
      {isLoading ? <p>Loading users...</p> : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id_agent}>
                <td>{user.nom_agent}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => openModal(user)} className="p-1"><Edit size={16}/></button>
                  <button onClick={() => deleteUserMutation.mutate(user.id_agent)} className="p-1 text-red-500"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">{editingUser ? 'Edit User' : 'Add User'}</h4>
              <button onClick={closeModal}><X/></button>
            </div>
            <UserForm
              onSubmit={handleFormSubmit}
              defaultValues={editingUser || {}}
              isEditMode={!!editingUser}
              isSubmitting={createUserMutation.isLoading || updateUserMutation.isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
