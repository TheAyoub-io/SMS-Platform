import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../common/Button';
import { CampaignData } from '../../services/campaignApi';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  type: z.string().min(1, 'Campaign type is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  template_id: z.number().optional(),
  custom_message: z.string().optional(),
  mailing_list_ids: z.array(z.number()).min(1, 'At least one mailing list is required'),
});

interface CampaignFormProps {
  onSubmit: (data: CampaignData) => void;
  initialData?: Partial<CampaignData>;
  isLoading?: boolean;
}

const CampaignForm = ({ onSubmit, initialData, isLoading }: CampaignFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name">Campaign Name</label>
        <input id="name" {...register('name')} className="block w-full border-gray-300 rounded-md" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="type">Campaign Type</label>
        <input id="type" {...register('type')} className="block w-full border-gray-300 rounded-md" />
        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
      </div>
      <div>
        <label htmlFor="start_date">Start Date</label>
        <input id="start_date" type="date" {...register('start_date')} className="block w-full border-gray-300 rounded-md" />
        {errors.start_date && <p className="text-red-500">{errors.start_date.message}</p>}
      </div>
      <div>
        <label htmlFor="end_date">End Date</label>
        <input id="end_date" type="date" {...register('end_date')} className="block w-full border-gray-300 rounded-md" />
        {errors.end_date && <p className="text-red-500">{errors.end_date.message}</p>}
      </div>
      {/* Add fields for template/custom message and mailing lists */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Campaign'}
      </Button>
    </form>
  );
};

export default CampaignForm;
