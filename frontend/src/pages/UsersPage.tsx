import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import UserForm from "../components/UserForm";
import { toast } from "react-hot-toast";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get<User[]>("/users");
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiService.delete(`/users/${id}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingUser) {
        await apiService.put(`/users/${editingUser.id}`, data);
        toast.success("User updated successfully");
      } else {
        await apiService.post("/users", data);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to save user");
    }
  };

  const columns = [
    { header: "Full Name", accessor: "full_name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Role", accessor: "role" as const },
    { header: "Active", accessor: "is_active" as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table<User>
          columns={columns}
          data={users}
          renderActions={(user) => (
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create User"}
      >
        <UserForm
          onSubmit={handleFormSubmit}
          initialValues={editingUser || {}}
          isEditing={!!editingUser}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;
