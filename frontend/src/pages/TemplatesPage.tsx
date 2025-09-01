import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';
import TemplateForm from '../components/TemplateForm'; // This will be created next

const { Title } = Typography;

export interface Template {
  id_modele: number;
  nom_modele: string;
  contenu_modele: string;
}

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      message.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Template) => {
    setEditingTemplate(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
        await api.delete(`/templates/${id}`);
        message.success('Template deleted successfully');
        fetchTemplates();
    } catch (error) {
        console.error('Failed to delete template:', error);
        message.error('Failed to delete template');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalFinish = async (values: any) => {
    try {
      if (editingTemplate && 'id_modele' in editingTemplate) {
        await api.put(`/templates/${editingTemplate.id_modele}`, values);
        message.success('Template updated successfully');
      } else {
        await api.post('/templates/', values);
        message.success('Template created successfully');
      }
      setIsModalVisible(false);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      message.error('Failed to save template');
    }
  };

  const columns: TableProps<Template>['columns'] = [
    { title: 'Template Name', dataIndex: 'nom_modele', key: 'nom_modele' },
    { title: 'Content', dataIndex: 'contenu_modele', key: 'contenu_modele' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>Edit</a>
          <Popconfirm
            title="Delete this template?"
            onConfirm={() => handleDelete(record.id_modele)}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Message Templates</Title>
        <Button type="primary" onClick={handleCreate}>Create Template</Button>
      </div>
      <Table columns={columns} dataSource={templates} rowKey="id_modele" loading={loading} />
      <TemplateForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
        initialValues={editingTemplate}
      />
    </div>
  );
};

export default TemplatesPage;
