import React, { useState } from 'react';
import { Modal, Steps, Button, message, Form } from 'antd';
import Step1_BasicInfo from './campaign_steps/Step1_BasicInfo';
import Step2_Template from './campaign_steps/Step2_Template';
import Step3_Audience from './campaign_steps/Step3_Audience';
import Step4_Review from './campaign_steps/Step4_Review';
import api from '../services/api';

interface CreateCampaignWizardProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateCampaignWizard: React.FC<CreateCampaignWizardProps> = ({ visible, onCancel, onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();

  const steps = [
    { title: 'Basic Info', content: <Step1_BasicInfo /> },
    { title: 'Template', content: <Step2_Template /> },
    { title: 'Audience', content: <Step3_Audience /> },
    { title: 'Review', content: <Step4_Review campaignData={form.getFieldsValue(true)} /> },
  ];

  const next = async () => {
    try {
      await form.validateFields();
      setCurrent(current + 1);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleDone = async () => {
    try {
      const allData = form.getFieldsValue(true);

      const mailingListData = {
        nom_liste: allData.nom_liste,
        description: "",
        contact_ids: allData.contact_ids || [],
        id_campagne: null,
      };
      const mailingListResponse = await api.post('/mailing-lists/', mailingListData);
      const mailingListId = mailingListResponse.data.id_liste;

      const campaignDraftPayload = {
        nom_campagne: allData.nom_campagne,
        date_debut: allData.date_range[0].toISOString(),
        date_fin: allData.date_range[1].toISOString(),
        id_modele: allData.id_modele,
        type_campagne: allData.type_campagne,
        statut: 'draft',
      };
      const campaignResponse = await api.post('/campaigns/', campaignDraftPayload);
      const campaignId = campaignResponse.data.id_campagne;

      await api.put(`/mailing-lists/${mailingListId}`, { id_campagne: campaignId });

      const campaignUpdatePayload = {
        ...campaignDraftPayload,
        statut: 'scheduled',
      };
      await api.put(`/campaigns/${campaignId}`, campaignUpdatePayload);

      message.success('Campaign created successfully!');
      onSuccess();
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
      <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 24 }}>
        {steps.map((step, index) => (
          <div key={step.title} style={{ display: index === current ? 'block' : 'none' }}>
            {step.content}
          </div>
        ))}
      </Form>
    </Modal>
  );
};

export default CreateCampaignWizard;
