import { Button, Form, Input, Card, Typography } from 'antd';
import api from '../services/api';

const { Title } = Typography;

const LoginPage = () => {
  const onFinish = async (values: any) => {
    try {
      const response = await api.post('/auth/login', {
        identifiant: values.username,
        password: values.password,
      });
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      // TODO: Redirect to dashboard
      window.location.href = '/dashboard'; // Simple redirect for now
    } catch (error) {
      console.error('Failed to login:', error);
      // TODO: Show error notification
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
