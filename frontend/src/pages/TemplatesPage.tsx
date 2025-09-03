import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import TemplateForm from "../components/TemplateForm";
import { toast } from "react-hot-toast";

export interface Template {
  id: number;
  name: string;
  content: string;
}

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(
    null
  );

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get<Template[]>("/templates");
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await apiService.delete(`/templates/${id}`);
        toast.success("Template deleted successfully");
        fetchTemplates();
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTemplate) {
        await apiService.put(`/templates/${editingTemplate.id}`, data);
        toast.success("Template updated successfully");
      } else {
        await apiService.post("/templates", data);
        toast.success("Template created successfully");
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Content", accessor: "content" as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Templates</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Template
        </button>
      </div>

      {loading ? (
        <p>Loading templates...</p>
      ) : (
        <Table<Template>
          columns={columns}
          data={templates}
          renderActions={(template) => (
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(template)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
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
        title={editingTemplate ? "Edit Template" : "Create Template"}
      >
        <TemplateForm
          onSubmit={handleFormSubmit}
          initialValues={editingTemplate || {}}
        />
      </Modal>
    </div>
  );
};

export default TemplatesPage;
