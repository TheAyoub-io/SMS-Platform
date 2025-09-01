import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, Select, Checkbox } from 'antd';

// This type would ideally be in a shared types file
interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  email: string;
  segment: string;
}

interface ContactFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: Partial<Contact> | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ visible, onCancel, onFinish, initialValues }) => {
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
      title={initialValues ? 'Edit Contact' : 'Create Contact'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" initialValues={{ statut_opt_in: true }}>
        <Form.Item name="prenom" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="nom" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="numero_telephone" label="Phone Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="segment" label="Segment">
          <Input />
        </Form.Item>
        <Form.Item name="statut_opt_in" valuePropName="checked">
          <Checkbox>Opt-in to communications</Checkbox>
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

export default ContactForm;
