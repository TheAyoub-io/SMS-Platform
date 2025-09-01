import React, { useState } from 'react';
import { Modal, Steps, Button, message } from 'antd';
import Step1_BasicInfo from './campaign_steps/Step1_BasicInfo';
import Step2_Template from './campaign_steps/Step2_Template';
import Step3_Contacts from './campaign_steps/Step3_Contacts';
import Step4_Review from './campaign_steps/Step4_Review';

interface CreateCampaignWizardProps {
  visible: boolean;
  onCancel: () => void;
}

const steps = [
  { title: 'Basic Info', content: <Step1_BasicInfo /> },
  { title: 'Template', content: <Step2_Template /> },
  { title: 'Contacts', content: <Step3_Contacts /> },
  { title: 'Review', content: <Step4_Review /> },
];

const CreateCampaignWizard: React.FC<CreateCampaignWizardProps> = ({ visible, onCancel }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
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
            <Button type="primary" onClick={() => message.success('Processing complete!')}>
              Done
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
