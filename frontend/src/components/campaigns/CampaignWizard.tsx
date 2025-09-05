import { useState } from 'react';
import { useCreateCampaign } from '../../hooks/useCampaigns';
import CampaignForm from './CampaignForm';
import { CampaignData } from '../../services/campaignApi';

const CampaignWizard = () => {
  const [step, setStep] = useState(1);
  const createCampaignMutation = useCreateCampaign();

  const handleSubmit = (data: CampaignData) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create Campaign - Step {step}</h2>
      {step === 1 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Info</h3>
          {/* A simplified form for step 1 */}
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Message</h3>
           <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}
       {step === 3 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Audience</h3>
           <button onClick={() => setStep(4)}>Next</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Review</h3>
          <CampaignForm onSubmit={handleSubmit} isLoading={createCampaignMutation.isLoading} />
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;
