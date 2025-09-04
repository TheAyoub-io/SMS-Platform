import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Campaign } from "../pages/CampaignsPage";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().min(1, "Type is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type CampaignFormInputs = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  onSubmit: (data: CampaignFormInputs) => void;
  initialValues?: Partial<Campaign>;
}

const CampaignForm = ({ onSubmit, initialValues }: CampaignFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormInputs>({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <input
          id="status"
          {...register("status")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Type
        </label>
        <input
          id="type"
          {...register("type")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium">
          Start Date
        </label>
        <input
          id="start_date"
          type="date"
          {...register("start_date")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.start_date && (
          <p className="mt-1 text-sm text-red-600">
            {errors.start_date.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium">
          End Date
        </label>
        <input
          id="end_date"
          type="date"
          {...register("end_date")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {errors.end_date && (
          <p className="mt-1 text-sm text-red-600">
            {errors.end_date.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  );
};

export default CampaignForm;
