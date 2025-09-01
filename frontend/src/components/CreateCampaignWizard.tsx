import React, { useState } from 'react';
import { Modal, Steps, Button, message, Form } from 'antd';
import Step1_BasicInfo from './campaign_steps/Step1_BasicInfo';
import Step2_Template from './campaign_steps/Step2_Template';
import Step3_Contacts from './campaign_steps/Step3_Contacts';
import Step4_Review from './campaign_steps/Step4_Review';
import api from '../services/api';

interface CreateCampaignWizardProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateCampaignWizard: React.FC<CreateCampaignWizardProps> = ({ visible, onCancel, onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [campaignData, setCampaignData] = useState<any>({});
  const [form] = Form.useForm();

  const steps = [
    { title: 'Basic Info', content: <Step1_BasicInfo form={form} /> },
    { title: 'Template', content: <Step2_Template form={form} /> },
    { title: 'Contacts', content: <Step3_Contacts /> }, // Placeholder
    { title: 'Review', content: <Step4_Review campaignData={campaignData} /> },
  ];

  const next = async () => {
    try {
      const values = await form.validateFields();
      setCampaignData({ ...campaignData, ...values });
      setCurrent(current + 1);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const prev = () => {
    const values = form.getFieldsValue();
    setCampaignData({ ...campaignData, ...values });
    setCurrent(current - 1);
  };

  const handleDone = async () => {
    const finalData = {
      ...campaignData,
      date_debut: campaignData.date_range[0].toISOString(),
      date_fin: campaignData.date_range[1].toISOString(),
    };
    delete finalData.date_range;

    try {
      await api.post('/campaigns/', finalData);
      message.success('Campaign created successfully!');
      onSuccess(); // Close modal and refresh table
    } catch (error) {
      console.error('Failed to create campaign:', error);
      message.error('Failed to create campaign.');
    }
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <Modal
      title="Create a New Campaign"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={
        <div style={{ marginTop: 24 }}>
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={handleDone}>
              Launch Campaign
            </Button>
          )}
        </div>
      }
    >
      <Steps current={current} items={items} />
      <div style={{ marginTop: 24 }}>{steps[current].content}</div>
    </Modal>
  );
};

export default CreateCampaignWizard;
