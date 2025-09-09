import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCreateCampaign, useUpdateCampaign } from '../../hooks/useCampaigns';
import { useCreateMailingList } from '../../hooks/useMailingLists';
import { useTemplates } from '../../hooks/useTemplates';

import CampaignForm, { CampaignFormInputs } from './CampaignForm';
import MailingListForm, { MailingListFormInputs } from '../mailing_lists/MailingListForm';
import CampaignLauncher from './CampaignLauncher';
import { Campaign } from '../../services/campaignApi';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type CampaignWizardState = Partial<Campaign>;

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignWizardState>({});

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const createMailingListMutation = useCreateMailingList();

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCampaignData({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleStep1Submit = (data: CampaignFormInputs) => {
    const payload = {
      ...data,
      statut: 'draft' as const,
      date_debut: new Date(data.date_debut).toISOString(),
      date_fin: new Date(data.date_fin).toISOString(),
    };
    createCampaignMutation.mutate(payload, {
      onSuccess: (createdCampaign) => {
        toast.success(`Campaign "${createdCampaign.nom_campagne}" created as draft.`);
        setCampaignData(createdCampaign);
        handleNext();
      },
      onError: (error: Error) => {
        toast.error(`Failed to create campaign: ${error.message}`);
      },
    });
  };

  const handleStep2Next = () => {
    if (!campaignData.id_campagne || !campaignData.id_modele) {
      toast.error("Please select a template.");
      return;
    }
    updateCampaignMutation.mutate(
      { id: campaignData.id_campagne, payload: { id_modele: campaignData.id_modele } },
      {
        onSuccess: (updatedCampaign) => {
          toast.success(`Campaign "${updatedCampaign.nom_campagne}" updated.`);
          handleNext();
        },
        onError: (error: Error) => {
          toast.error(`Failed to update campaign: ${error.message}`);
        },
      }
    );
  };

  const handleStep3Submit = (data: MailingListFormInputs) => {
    if (!campaignData.id_campagne) {
      toast.error("Campaign ID not found. Please go back to step 1.");
      return;
    }
    const payload = { ...data, id_campagne: campaignData.id_campagne };
    createMailingListMutation.mutate(payload, {
      onSuccess: () => {
        handleNext();
      }
    });
  };

  const isLoading = createCampaignMutation.isLoading || updateCampaignMutation.isLoading || createMailingListMutation.isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Create New Campaign</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Progress Bar Placeholder */}

          {step === 1 && <CampaignForm onSubmit={handleStep1Submit} isSubmitting={createCampaignMutation.isLoading} />}
          {step === 2 && (
              <div>
                <h3 className="font-medium mb-4 text-lg">2. Choose Template</h3>
                {isLoadingTemplates ? <p>Loading templates...</p> : (
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    onChange={(e) => setCampaignData(prev => ({ ...prev, id_modele: parseInt(e.target.value) }))}
                    value={campaignData.id_modele || ''}
                  >
                    <option value="">Select a template</option>
                    {templates?.map(t => <option key={t.id_modele} value={t.id_modele}>{t.nom_modele}</option>)}
                  </select>
                )}
              </div>
          )}
          {step === 3 && (
              <div>
                <h3 className="font-medium mb-4 text-lg">3. Create a Mailing List</h3>
                <MailingListForm onSubmit={handleStep3Submit} isSubmitting={createMailingListMutation.isLoading} />
              </div>
          )}
          {step === 4 && (
              <CampaignLauncher campaign={campaignData} onLaunch={onClose} />
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
          <button onClick={handleBack} disabled={step === 1 || isLoading} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">
            <ArrowLeft size={16} className="mr-1"/> Back
          </button>

          {step < 4 && (
            <>
              {step !== 3 && (
                 <button onClick={step === 2 ? handleStep2Next : handleNext} disabled={isLoading} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Next'} <ArrowRight size={16} className="ml-1"/>
                 </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
