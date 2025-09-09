import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getMailingLists, createMailingList, MailingList, MailingListCreationPayload } from '../services/mailingListApi';
import toast from 'react-hot-toast';

const MAILING_LISTS_QUERY_KEY = 'mailingLists';

export const useMailingLists = () => {
  return useQuery<MailingList[], Error>(MAILING_LISTS_QUERY_KEY, getMailingLists);
};

export const useCreateMailingList = () => {
  const queryClient = useQueryClient();

  return useMutation(createMailingList, {
    onSuccess: () => {
      // Maybe we don't need to invalidate the whole list of lists here,
      // but it's fine for now.
      queryClient.invalidateQueries(MAILING_LISTS_QUERY_KEY);
      toast.success('Mailing list created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create mailing list: ${error.message}`);
    },
  });
};
