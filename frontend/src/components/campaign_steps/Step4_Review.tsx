import React from 'react';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';

interface Step4Props {
  campaignData: any;
}

const Step4_Review: React.FC<Step4Props> = ({ campaignData }) => {
  return (
    <Descriptions title="Campaign Summary" bordered column={1}>
      <Descriptions.Item label="Campaign Name">{campaignData.nom_campagne}</Descriptions.Item>
      <Descriptions.Item label="Campaign Type">{campaignData.type_campagne}</Descriptions.Item>
      <Descriptions.Item label="Status">{campaignData.statut}</Descriptions.Item>
      <Descriptions.Item label="Start Date">
        {campaignData.date_range ? dayjs(campaignData.date_range[0]).format('YYYY-MM-DD HH:mm:ss') : ''}
      </Descriptions.Item>
      <Descriptions.Item label="End Date">
        {campaignData.date_range ? dayjs(campaignData.date_range[1]).format('YYYY-MM-DD HH:mm:ss') : ''}
      </Descriptions.Item>
      <Descriptions.Item label="Message Content">{campaignData.contenu_modele}</Descriptions.Item>
    </Descriptions>
  );
};

export default Step4_Review;
