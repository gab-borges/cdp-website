import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import './materials.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const makeFormState = () => ({ title: '', description: '', file: null, thumbnail: null });

function Materials() {
  const { setHeaderUser } = useOutletContext() ?? {};
  const [me, setMe] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formState, setFormState] = useState(() => makeFormState());
  const [showUpload, setShowUpload] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(() => makeFormState());
  const [editMessage, setEditMessage] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = me?.role === 'admin';

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('http://localhost:3000/api/v1/materials');
      const list = Array.isArray(data?.materials) ? data.materials : [];
      setMaterials(list);
    } catch (err) {
      console.error('Falha ao carregar materiais:', err);
      setError('Não foi possível carregar os materiais no momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/me');
      setMe(data);
    } catch (err) {
      console.error('Falha ao carregar usuário atual:', err);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
    loadMe();
  }, [loadMaterials, loadMe]);

  useEffect(() => {
    if (!setHeaderUser || !me) return;
    setHeaderUser(me);
  }, [me, setHeaderUser]);

  useEffect(() => {
    if (!formMessage) return undefined;
    const timeoutId = setTimeout(() => setFormMessage(''), 3500);
    return () => clearTimeout(timeoutId);
  }, [formMessage]);

  useEffect(() => {
    if (!editMessage) return undefined;
    const timeoutId = setTimeout(() => setEditMessage(''), 3500);
    return () => clearTimeout(timeoutId);
  }, [editMessage]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const [file] = files || [];
    setFormState((prev) => ({ ...prev, [name]: file ?? null }));
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (event) => {
    const { name, files } = event.target;
    const [file] = files || [];
    setEditForm((prev) => ({ ...prev, [name]: file ?? null }));
  };

  const resetForm = () => {
    setFormState(makeFormState());
    setFormError('');
    setFormMessage('');
  };

  const resetEdit = () => {
    setEditingId(null);
    setEditForm(makeFormState());
    setEditError('');
    setEditMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      setFormError('Informe um título para o material.');
      return;
    }
    if (!formState.file) {
      setFormError('Selecione um arquivo para disponibilizar o download.');
      return;
    }
    if (!formState.thumbnail) {
      setFormError('Selecione uma imagem em miniatura.');
      return;
    }

    const payload = new FormData();
    payload.append('material[title]', formState.title.trim());
    payload.append('material[description]', formState.description.trim());
    payload.append('material[file]', formState.file);
    payload.append('material[thumbnail]', formState.thumbnail);

    try {
      setUploading(true);
      setFormError('');
      const { data } = await axios.post('http://localhost:3000/api/v1/materials', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials((prev) => [data, ...prev]);
      setFormMessage('Material publicado com sucesso.');
      resetForm();
      setShowUpload(false);
    } catch (err) {
      console.error('Falha ao enviar material:', err);
      const message = err?.response?.data?.errors?.join(' ') || err.message || 'Não foi possível publicar o material.';
      setFormError(message);
    } finally {
      setUploading(false);
    }
  };

  const beginEdit = (material) => {
    setEditingId(material.id);
    setEditForm({
      title: material.title || '',
      description: material.description || '',
      file: null,
      thumbnail: null,
    });
    setEditError('');
    setEditMessage('');
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    if (!editForm.title.trim()) {
      setEditError('Informe um título para o material.');
      return;
    }

    const payload = new FormData();
    payload.append('material[title]', editForm.title.trim());
    payload.append('material[description]', editForm.description.trim());
    if (editForm.file) payload.append('material[file]', editForm.file);
    if (editForm.thumbnail) payload.append('material[thumbnail]', editForm.thumbnail);

    try {
      setSavingEdit(true);
      setEditError('');
      const { data } = await axios.patch(`http://localhost:3000/api/v1/materials/${editingId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setEditMessage('Material atualizado com sucesso.');
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        file: null,
        thumbnail: null,
      });
      setEditingId(data.id);
    } catch (err) {
      console.error('Falha ao atualizar material:', err);
      const message = err?.response?.data?.errors?.join(' ') || err.message || 'Não foi possível atualizar o material.';
      setEditError(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Remover o material "${material.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      setDeletingId(material.id);
      await axios.delete(`http://localhost:3000/api/v1/materials/${material.id}`);
      setMaterials((prev) => prev.filter((item) => item.id !== material.id));
      if (editingId === material.id) {
        resetEdit();
      }
    } catch (err) {
      console.error('Falha ao remover material:', err);
      alert('Não foi possível remover o material. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const cards = useMemo(() => {
    if (!materials.length) return [];
    return materials.map((material) => ({
      id: material.id,
      title: material.title,
      description: material.description,
      downloadUrl: material.download_url,
      thumbnailUrl: material.thumbnail_url,
      createdAt: material.created_at,
      filename: material.filename,
    }));
  }, [materials]);

  return (
    <div className="materials-root">
      <main className="materials-main materials-container">
        <header className="materials-head">
          <div>
            <h1 className="materials-title">Materiais</h1>
            <p className="materials-sub">Downloads e conteúdos compartilhados pela equipe.</p>
          </div>
        </header>

        {isAdmin && (
          <section className="materials-card materials-upload">
            <header className="materials-upload-head">
              <h2 className="materials-section-title">Publicar material</h2>
              <button
                type="button"
                className="lp-btn lp-btn-ghost"
                onClick={() => setShowUpload((prev) => !prev)}
              >
                {showUpload ? 'Ocultar' : 'Novo material'}
              </button>
            </header>

            {showUpload && (
              <form className="materials-form" onSubmit={handleSubmit}>
                <div className="materials-form-row">
                  <label htmlFor="material-title">Título</label>
                  <input
                    id="material-title"
                    name="title"
                    type="text"
                    value={formState.title}
                    onChange={handleFieldChange}
                    placeholder="Nome do material"
                    disabled={uploading}
                  />
                </div>

              <div className="materials-form-row">
                <label htmlFor="material-description">Descrição (opcional)</label>
                <textarea
                  id="material-description"
                  name="description"
                  value={formState.description}
                  onChange={handleFieldChange}
                  placeholder="Resumo curto do conteúdo"
                  disabled={uploading}
                  rows={3}
                />
              </div>

              <div className="materials-form-grid">
                <div className="materials-form-row">
                  <label htmlFor="material-file">Arquivo</label>
                  <input
                    id="material-file"
                    name="file"
                    type="file"
                    accept=".pdf,.zip,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.md"
                    onChange={handleFileChange}
                    disabled={uploading}
                    required
                  />
                  {formState.file && <span className="materials-file-meta">{formState.file.name}</span>}
                </div>

                <div className="materials-form-row">
                  <label htmlFor="material-thumbnail">Miniatura</label>
                  <input
                    id="material-thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    required
                  />
                  {formState.thumbnail && <span className="materials-file-meta">{formState.thumbnail.name}</span>}
                </div>
              </div>

              {formError && <div className="materials-alert materials-alert-error">{formError}</div>}
              {formMessage && <div className="materials-alert materials-alert-success">{formMessage}</div>}

                <div className="materials-actions">
                  <button type="button" className="lp-btn lp-btn-ghost" onClick={resetForm} disabled={uploading}>
                    Limpar
                  </button>
                  <button type="submit" className="lp-btn" disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Publicar'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {isAdmin && editingId && (
          <section className="materials-card materials-edit">
            <header className="materials-upload-head">
              <h2 className="materials-section-title">Editar material</h2>
              <button type="button" className="lp-btn lp-btn-ghost" onClick={resetEdit} disabled={savingEdit}>
                Cancelar edição
              </button>
            </header>

            <form className="materials-form" onSubmit={handleEditSubmit}>
              <div className="materials-form-row">
                <label htmlFor="edit-material-title">Título</label>
                <input
                  id="edit-material-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditFieldChange}
                  placeholder="Nome do material"
                  disabled={savingEdit}
                  required
                />
              </div>

              <div className="materials-form-row">
                <label htmlFor="edit-material-description">Descrição</label>
                <textarea
                  id="edit-material-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFieldChange}
                  placeholder="Resumo curto do conteúdo"
                  disabled={savingEdit}
                  rows={3}
                />
              </div>

              <div className="materials-form-grid">
                <div className="materials-form-row">
                  <label htmlFor="edit-material-file">Novo arquivo (opcional)</label>
                  <input
                    id="edit-material-file"
                    name="file"
                    type="file"
                    accept=".pdf,.zip,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.md"
                    onChange={handleEditFileChange}
                    disabled={savingEdit}
                  />
                  {editForm.file && <span className="materials-file-meta">{editForm.file.name}</span>}
                </div>

                <div className="materials-form-row">
                  <label htmlFor="edit-material-thumbnail">Nova miniatura (opcional)</label>
                  <input
                    id="edit-material-thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    disabled={savingEdit}
                  />
                  {editForm.thumbnail && <span className="materials-file-meta">{editForm.thumbnail.name}</span>}
                </div>
              </div>

              {editError && <div className="materials-alert materials-alert-error">{editError}</div>}
              {editMessage && <div className="materials-alert materials-alert-success">{editMessage}</div>}

              <div className="materials-actions">
                <button type="button" className="lp-btn lp-btn-ghost" onClick={resetEdit} disabled={savingEdit}>
                  Cancelar
                </button>
                <button type="submit" className="lp-btn" disabled={savingEdit}>
                  {savingEdit ? 'Salvando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </section>
        )}

        {loading && <div className="materials-card">Carregando materiais...</div>}
        {error && <div className="materials-card materials-error">{error}</div>}

        {!loading && !error && !cards.length && (
          <div className="materials-card">Nenhum material disponível ainda.</div>
        )}

        {!loading && !error && cards.length > 0 && (
          <section className="materials-grid">
            {cards.map((card) => (
              <article key={card.id} className="materials-item">
                <div className="materials-thumb-wrap">
                  {card.thumbnailUrl ? (
                    <img src={card.thumbnailUrl} alt="Miniatura do material" className="materials-thumb" />
                  ) : (
                    <div className="materials-thumb materials-thumb-placeholder">Sem imagem</div>
                  )}
                </div>
                <div className="materials-body">
                  <div className="materials-item-head">
                    <h3 className="materials-item-title">{card.title}</h3>
                    {isAdmin && (
                      <div className="materials-item-actions">
                        <button type="button" className="lp-btn lp-btn-ghost" onClick={() => beginEdit(card)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="lp-btn lp-btn-ghost materials-action-danger"
                          onClick={() => handleDelete(card)}
                          disabled={deletingId === card.id}
                        >
                          {deletingId === card.id ? 'Removendo...' : 'Remover'}
                        </button>
                      </div>
                    )}
                  </div>
                  {card.description && <p className="materials-item-desc">{card.description}</p>}
                  <div className="materials-meta">
                    <span>{formatDateTime(card.createdAt)}</span>
                    {card.filename && <span className="materials-filename">{card.filename}</span>}
                  </div>
                  {card.downloadUrl && (
                    <a className="lp-btn" href={card.downloadUrl} target="_blank" rel="noopener noreferrer">
                      Baixar material
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Materials;
