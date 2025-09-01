import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

// This type would ideally be in a shared types file
interface Campaign {
  id_campagne: number;
  nom_campagne: string;
  statut: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string;
}

interface CampaignFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: Partial<Campaign> | null;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date_range: initialValues.date_debut && initialValues.date_fin ?
                    [dayjs(initialValues.date_debut), dayjs(initialValues.date_fin)] : null,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, visible]);

  const handleFinish = (values: any) => {
    const processedValues = {
      ...values,
      date_debut: values.date_range[0].toISOString(),
      date_fin: values.date_range[1].toISOString(),
    };
    delete processedValues.date_range;
    onFinish(processedValues);
  };

  return (
    <Modal
      title={initialValues ? 'Edit Campaign' : 'Create Campaign'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
        <Form.Item name="nom_campagne" label="Campaign Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
          <DatePicker.RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="type_campagne" label="Campaign Type" rules={[{ required: true }]}>
          <Select placeholder="Select a campaign type">
            <Select.Option value="promotional">Promotional</Select.Option>
            <Select.Option value="informational">Informational</Select.Option>
            <Select.Option value="follow_up">Follow-up</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="statut" label="Status" rules={[{ required: true }]}>
           <Select placeholder="Select a status">
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="scheduled">Scheduled</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            {initialValues ? 'Save' : 'Create'}
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CampaignForm;
