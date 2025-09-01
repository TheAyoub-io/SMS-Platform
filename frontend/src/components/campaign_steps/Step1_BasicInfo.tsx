import React from 'react';
import { Form, Input, DatePicker, Select } from 'antd';

const Step1_BasicInfo: React.FC = () => {
  return (
    <>
      <Form.Item name="nom_campagne" label="Campaign Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
        <DatePicker.RangePicker style={{ width: '100%' }} showTime />
      </Form.Item>
      <Form.Item name="type_campagne" label="Campaign Type" rules={[{ required: true }]}>
        <Select placeholder="Select a campaign type">
          <Select.Option value="promotional">Promotional</Select.Option>
          <Select.Option value="informational">Informational</Select.Option>
          <Select.Option value="follow_up">Follow-up</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="statut" label="Status" initialValue="draft" rules={[{ required: true }]}>
         <Select>
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="scheduled">Scheduled</Select.Option>
        </Select>
      </Form.Item>
    </>
  );
};

export default Step1_BasicInfo;
