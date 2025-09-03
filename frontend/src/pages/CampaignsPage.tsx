import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import CampaignForm from "../components/CampaignForm";
import { toast } from "react-hot-toast";

export interface Campaign {
  id: number;
  name: string;
  status: string;
  type: string;
  start_date: string;
  end_date: string;
}

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(
    null
  );

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get<Campaign[]>("/campaigns");
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await apiService.delete(`/campaigns/${id}`);
        toast.success("Campaign deleted successfully");
        fetchCampaigns();
      } catch (error) {
        toast.error("Failed to delete campaign");
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCampaign) {
        await apiService.put(`/campaigns/${editingCampaign.id}`, data);
        toast.success("Campaign updated successfully");
      } else {
        await apiService.post("/campaigns", data);
        toast.success("Campaign created successfully");
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to save campaign");
    }
  };

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Status", accessor: "status" as const },
    { header: "Type", accessor: "type" as const },
    { header: "Start Date", accessor: "start_date" as const },
    { header: "End Date", accessor: "end_date" as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Campaign
        </button>
      </div>

      {loading ? (
        <p>Loading campaigns...</p>
      ) : (
        <Table<Campaign>
          columns={columns}
          data={campaigns}
          renderActions={(campaign) => (
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(campaign)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(campaign.id)}
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
        title={editingCampaign ? "Edit Campaign" : "Create Campaign"}
      >
        <CampaignForm
          onSubmit={handleFormSubmit}
          initialValues={editingCampaign || {}}
        />
      </Modal>
    </div>
  );
};

export default CampaignsPage;
