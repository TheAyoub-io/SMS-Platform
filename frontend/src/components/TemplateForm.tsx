import React, { useEffect } from 'react';
import { Form, Input, Button, Modal } from 'antd';

interface TemplateFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: any | null;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form, visible]);

  return (
    <Modal
      title={initialValues ? 'Edit Template' : 'Create Template'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item name="nom_modele" label="Template Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contenu_modele" label="Template Content" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Use {variable_name} for variables" />
        </Form.Item>
        <Form.Item name="variables" label="Variables (JSON format)">
          <Input.TextArea rows={2} placeholder='e.g., {"name": "string", "date": "string"}' />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            {initialValues ? 'Save' : 'Create'}
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateForm;
