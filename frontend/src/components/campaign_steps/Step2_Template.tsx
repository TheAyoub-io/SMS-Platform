import React, { useState, useEffect } from 'react';
import { Form, Select, Input, message } from 'antd';
import api from '../../services/api';

interface Template {
  id_modele: number;
  nom_modele: string;
  contenu_modele: string;
}

const Step2_Template: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const form = Form.useFormInstance();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/templates');
        setTemplates(response.data);
      } catch (error) {
        message.error('Failed to fetch templates.');
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (value: number) => {
    const template = templates.find(t => t.id_modele === value);
    if (template) {
      form.setFieldsValue({ contenu_modele: template.contenu_modele });
    } else {
      form.setFieldsValue({ contenu_modele: '' });
    }
    setSelectedTemplate(value);
  };

  return (
    <>
      <Form.Item name="id_modele" label="Choose a Template (Optional)">
        <Select
          placeholder="Select a template"
          onChange={handleTemplateChange}
          allowClear
        >
          {templates.map(template => (
            <Select.Option key={template.id_modele} value={template.id_modele}>
              {template.nom_modele}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="contenu_modele"
        label="Message Content"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={4} disabled={!!selectedTemplate} />
      </Form.Item>
    </>
  );
};

export default Step2_Template;
