import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  MessageOutlined,
  ContactsOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined, // Import new icon
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<MessageOutlined />}>
            <Link to="/campaigns">Campaigns</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ContactsOutlined />}>
            <Link to="/contacts">Contacts</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<FileTextOutlined />}>
            <Link to="/templates">Templates</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<TeamOutlined />}>
            <Link to="/users">User Management</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet /> {/* This is where the nested page component will be rendered */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
