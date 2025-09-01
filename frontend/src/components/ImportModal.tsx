import { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import api from '../services/api';

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);

    setUploading(true);

    try {
      const response = await api.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploading(false);
      // Check for validation errors in the response
      if (response.data.errors) {
        message.error(response.data.message);
        // Potentially display detailed errors to the user
        console.error("Validation errors:", response.data.errors);
      } else {
        message.success(response.data.message || 'File uploaded successfully.');
        onSuccess(); // Close modal and refresh table
      }
    } catch (error: any) {
      setUploading(false);
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || 'File upload failed.';
      message.error(errorMsg);
    }
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent auto-upload
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title="Import Contacts"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={uploading} onClick={handleUpload}>
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>,
      ]}
    >
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <p style={{ marginTop: 8, color: '#888' }}>
        Upload a CSV or Excel file. Columns: FirstName, LastName, PhoneNumber, Email.
      </p>
    </Modal>
  );
};

export default ImportModal;
