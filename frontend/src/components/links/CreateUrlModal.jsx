import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Modal, Button, Input } from '../ui';
import api from '../../services/api';

export default function CreateUrlModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    expiryDate: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.originalUrl) e.originalUrl = 'URL is required';
    else {
      try { new URL(form.originalUrl); }
      catch { e.originalUrl = 'Enter a valid URL (include https://)'; }
    }
    if (form.customAlias && !/^[a-zA-Z0-9_-]+$/.test(form.customAlias)) {
      e.customAlias = 'Only letters, numbers, hyphens, underscores';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        ...(form.customAlias && { customAlias: form.customAlias }),
        ...(form.title && { title: form.title }),
        ...(form.expiryDate && { expiryDate: form.expiryDate }),
        ...(form.password && { password: form.password })
      };

      const res = await api.post('/urls', payload);
      toast.success('Link created!');
      onCreated(res.data.url);
      onClose();
      setForm({ originalUrl: '', customAlias: '', title: '', expiryDate: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Create new link">
      <div className="space-y-4">
        <Input
          label="Destination URL *"
          placeholder="https://example.com/very-long-url"
          value={form.originalUrl}
          onChange={set('originalUrl')}
          error={errors.originalUrl}
        />
        <Input
          label="Custom alias (optional)"
          placeholder="my-link"
          value={form.customAlias}
          onChange={set('customAlias')}
          error={errors.customAlias}
        />
        <Input
          label="Title (optional)"
          placeholder="My awesome link"
          value={form.title}
          onChange={set('title')}
        />
        <Input
          label="Expiry date (optional)"
          type="datetime-local"
          value={form.expiryDate}
          onChange={set('expiryDate')}
          min={new Date().toISOString().slice(0, 16)}
        />
        <Input
          label="Password protect (optional)"
          type="password"
          placeholder="Leave empty for public access"
          value={form.password}
          onChange={set('password')}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>Create link</Button>
        </div>
      </div>
    </Modal>
  );
}
