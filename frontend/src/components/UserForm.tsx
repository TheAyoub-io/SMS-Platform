import React, { useEffect } from 'react';
import { Form, Input, Button, Modal, Select, Checkbox } from 'antd';

interface UserFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues?: any | null;
}

const UserForm: React.FC<UserFormProps> = ({ visible, onCancel, onFinish, initialValues }) => {
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
      title={initialValues ? 'Edit User' : 'Create User'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item name="nom_agent" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="identifiant" label="Username" rules={[{ required: true }]}>
          <Input disabled={!!initialValues} />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Select a role">
            <Select.Option value="agent">Agent</Select.Option>
            <Select.Option value="supervisor">Supervisor</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: !initialValues }]}>
          <Input.Password placeholder={initialValues ? "Leave blank to keep unchanged" : ""} />
        </Form.Item>
        <Form.Item name="is_active" valuePropName="checked">
          <Checkbox>User is active</Checkbox>
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

export default UserForm;
