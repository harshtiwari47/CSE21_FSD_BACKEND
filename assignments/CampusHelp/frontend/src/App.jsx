import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Base API configuration (Supports Vite proxy at /api or direct backend port)
const API_BASE = (typeof window !== 'undefined' && (window.location.port === '3000' || window.location.port === '5000' || !window.location.port))
  ? '/api'
  : 'http://localhost:5000/api';



const CATEGORIES = [
  'Academic Services',
  'Facilities & Maintenance',
  'IT & Network Support',
  'Hostel & Housing',
  'Library & Labs',
  'Financial & Accounts'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

export default function App() {
  // Requests data state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);

  // Form submission state
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    category: 'IT & Network Support',
    priority: 'Medium',
    problemDescription: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formValidationErrors, setFormValidationErrors] = useState({});

  // Filtering & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Edit modal state
  const [editingRequest, setEditingRequest] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation modal state
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded descriptions set
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Show auto-dismissing banner notice
  const showBanner = (message, type = 'success') => {
    setBannerNotice({ message, type });
    setTimeout(() => {
      setBannerNotice(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // -------------------------------------------------------------
  // 1. Fetch All Requests (GET /api/requests)
  // -------------------------------------------------------------
  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/requests`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Unable to connect to Campus Help Desk API. Verify backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formValidationErrors[name]) {
      setFormValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  // Form validation
  const validateForm = (data) => {
    const errors = {};
    if (!data.studentName?.trim()) {
      errors.studentName = 'Student name is required.';
    }
    if (!data.email?.trim()) {
      errors.email = 'Campus email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = 'Please provide a valid email format.';
      }
    }
    if (!data.category) {
      errors.category = 'Select a problem category.';
    }
    if (!data.priority) {
      errors.priority = 'Specify priority level.';
    }
    if (!data.problemDescription?.trim()) {
      errors.problemDescription = 'Please provide a detailed description.';
    } else if (data.problemDescription.trim().length < 10) {
      errors.problemDescription = 'Description should be at least 10 characters.';
    }
    return errors;
  };

  // -------------------------------------------------------------
  // 2. Submit New Request (POST /api/requests)
  // -------------------------------------------------------------
  const handleSubmitNewRequest = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormValidationErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          email: formData.email.trim(),
          category: formData.category,
          problemDescription: formData.problemDescription.trim(),
          priority: formData.priority
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const created = await response.json();
      setRequests(prev => [created, ...prev]);

      // Reset form
      setFormData({
        studentName: '',
        email: '',
        category: 'IT & Network Support',
        priority: 'Medium',
        problemDescription: ''
      });
      setFormValidationErrors({});
      showBanner(`Ticket ${created.id} submitted successfully to campus dispatch.`, 'success');
    } catch (err) {
      console.error('Submit error:', err);
      showBanner(`Submission failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 3. Update Request (PUT /api/requests/:id)
  // -------------------------------------------------------------
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    const validationErrors = validateForm(editingRequest);
    if (Object.keys(validationErrors).length > 0) {
      showBanner('Please complete all required fields in the edit form.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: editingRequest.studentName.trim(),
          email: editingRequest.email.trim(),
          category: editingRequest.category,
          problemDescription: editingRequest.problemDescription.trim(),
          priority: editingRequest.priority,
          status: editingRequest.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const updated = await response.json();
      setRequests(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      setEditingRequest(null);
      showBanner(`Ticket ${updated.id} updated successfully.`, 'success');
    } catch (err) {
      console.error('Update error:', err);
      showBanner(`Update failed: ${err.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Delete Request (DELETE /api/requests/:id)
  // -------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!deletingRequestId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE}/requests/${deletingRequestId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      setRequests(prev => prev.filter(r => r.id !== deletingRequestId));
      showBanner(`Ticket ${deletingRequestId} was successfully deleted.`, 'success');
      setDeletingRequestId(null);
    } catch (err) {
      console.error('Delete error:', err);
      showBanner(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle description expansion
  const toggleDescription = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = requests.length;
    const open = requests.filter(r => r.status === 'Open').length;
    const inProgress = requests.filter(r => r.status === 'In Progress').length;
    const resolved = requests.filter(r => r.status === 'Resolved').length;
    return { total, open, inProgress, resolved };
  }, [requests]);

  // Filtered requests computation
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Category filter
      if (filterCategory !== 'ALL' && r.category !== filterCategory) {
        return false;
      }
      // Priority filter
      if (filterPriority !== 'ALL' && r.priority !== filterPriority) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'ALL' && r.status !== filterStatus) {
        return false;
      }
      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.studentName?.toLowerCase().includes(q);
        const matchesEmail = r.email?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q);
        const matchesDesc = r.problemDescription?.toLowerCase().includes(q);
        const matchesCat = r.category?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesId || matchesDesc || matchesCat;
      }
      return true;
    });
  }, [requests, filterCategory, filterPriority, filterStatus, searchQuery]);

  return (
    <div className="app-viewport">
      {/* Top Institutional Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-section">
            <span className="brand-crest">CH</span>
            <div className="brand-titles">
              <span className="brand-main">Campus Help Desk</span>
              <span className="brand-sub">Incident Management & Support Dispatch</span>
            </div>
          </div>
          <div className="header-status-pill">
            <span className="status-dot"></span>
            <span>REST API Connected</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-layout">
        {/* Banner Alert Feedback */}
        {bannerNotice && (
          <div className={`notification-banner ${bannerNotice.type}`} role="alert">
            <span>{bannerNotice.message}</span>
            <button
              type="button"
              className="notification-dismiss"
              onClick={() => setBannerNotice(null)}
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        )}

        {/* Operational KPI Strip */}
        <section className="kpi-strip" aria-label="Dispatch Summary">
          <div className="kpi-metric-item">
            <span className="kpi-label">Total Submissions</span>
            <span className="kpi-value">{metrics.total}</span>
          </div>
          <div className="kpi-metric-item">
            <span className="kpi-label">Open / Triage</span>
            <span className="kpi-value" style={{ color: 'var(--status-open-text)' }}>
              {metrics.open}
            </span>
          </div>
          <div className="kpi-metric-item">
            <span className="kpi-label">In Progress</span>
            <span className="kpi-value" style={{ color: 'var(--status-progress-text)' }}>
              {metrics.inProgress}
            </span>
          </div>
          <div className="kpi-metric-item">
            <span className="kpi-label">Resolved</span>
            <span className="kpi-value" style={{ color: 'var(--status-resolved-text)' }}>
              {metrics.resolved}
            </span>
          </div>
        </section>

        {/* =========================================================================
            INCIDENT SUBMISSION FORM
            ========================================================================= */}
        <section className="panel-section" aria-labelledby="form-heading">
          <div className="panel-header">
            <h2 id="form-heading" className="panel-title">
              <span>Submit Help Desk Request</span>
            </h2>
            <span className="panel-tagline">
              Official intake for campus facilities, IT, academic, and housing issues
            </span>
          </div>

          <div className="panel-body">
            <form className="incident-form" onSubmit={handleSubmitNewRequest} noValidate>
              <div className="form-row-2">
                {/* Student Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="studentName">
                    Student Name <span className="req-marker">*</span>
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Harsh Tiwari"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                  />
                  {formValidationErrors.studentName && (
                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                      {formValidationErrors.studentName}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Student Email <span className="req-marker">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="e.g., harsh@campus.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {formValidationErrors.email && (
                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                      {formValidationErrors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                {/* Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category <span className="req-marker">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formValidationErrors.category && (
                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                      {formValidationErrors.category}
                    </span>
                  )}
                </div>

                {/* Priority */}
                <div className="form-group">
                  <label className="form-label">
                    Priority Level <span className="req-marker">*</span>
                  </label>
                  <div className="priority-selector" role="radiogroup" aria-label="Priority level">
                    {PRIORITIES.map(lvl => {
                      const isSelected = formData.priority === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`priority-option-btn ${
                            isSelected ? `selected-${lvl.toLowerCase()}` : ''
                          }`}
                          onClick={() => handlePrioritySelect(lvl)}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                  {formValidationErrors.priority && (
                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                      {formValidationErrors.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="problemDescription">
                  Problem Description <span className="req-marker">*</span>
                </label>
                <textarea
                  id="problemDescription"
                  name="problemDescription"
                  className="form-textarea"
                  placeholder="Detail the issue, physical location (building/room), and symptoms observed..."
                  rows={3}
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  required
                ></textarea>
                {formValidationErrors.problemDescription && (
                  <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                    {formValidationErrors.problemDescription}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setFormData({
                      studentName: '',
                      email: '',
                      category: 'IT & Network Support',
                      priority: 'Medium',
                      problemDescription: ''
                    });
                    setFormValidationErrors({});
                  }}
                  disabled={submitting}
                >
                  Reset Form
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting to Dispatch...' : 'Submit Help Request'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* =========================================================================
            SUBMITTED REQUESTS LEDGER (DISPLAY ALL SUBMITTED REQUESTS BELOW FORM)
            ========================================================================= */}
        <section className="panel-section" aria-labelledby="ledger-heading">
          <div className="ledger-header">
            <div className="ledger-title-group">
              <h2 id="ledger-heading" className="panel-title">
                Submitted Requests Registry
              </h2>
              <span className="ledger-count-badge">
                {filteredRequests.length} of {requests.length} records
              </span>
            </div>
            <div>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={fetchAllRequests}
                title="Refresh requests list"
              >
                ↻ Refresh List
              </button>
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="ledger-toolbar">
            <div className="search-box-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by student, ID, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              {/* Category Filter */}
              <select
                className="filter-select"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                className="filter-select"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="ALL">All Priorities</option>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="filter-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="ledger-table-container">
            {loading ? (
              <div className="empty-ledger-state">
                <p>Loading campus dispatch records...</p>
              </div>
            ) : error ? (
              <div className="empty-ledger-state" style={{ color: '#991b1b' }}>
                <p className="empty-ledger-title">Data Retrieval Error</p>
                <p>{error}</p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: '12px' }}
                  onClick={fetchAllRequests}
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="empty-ledger-state">
                <p className="empty-ledger-title">No requests found</p>
                <p>
                  {requests.length === 0
                    ? 'No requests have been submitted yet. Use the form above to log a new ticket.'
                    : 'No requests matched your active filter criteria.'}
                </p>
                {(searchQuery ||
                  filterCategory !== 'ALL' ||
                  filterPriority !== 'ALL' ||
                  filterStatus !== 'ALL') && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: '12px' }}
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('ALL');
                      setFilterPriority('ALL');
                      setFilterStatus('ALL');
                    }}
                  >
                    Clear Filter Criteria
                  </button>
                )}
              </div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Student Details</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Problem Description</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(item => {
                    const isExpanded = expandedIds.has(item.id);
                    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="ticket-id">{item.id}</span>
                        </td>
                        <td>
                          <div className="student-meta">
                            <span className="student-name">{item.studentName}</span>
                            <span className="student-email">{item.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag">{item.category}</span>
                        </td>
                        <td>
                          <span className={`badge-priority ${item.priority?.toLowerCase()}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge-status ${item.status
                              ?.toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'currentColor'
                              }}
                            ></span>
                            {item.status || 'Open'}
                          </span>
                        </td>
                        <td className="desc-cell">
                          <div className={isExpanded ? '' : 'desc-clamp'}>
                            {item.problemDescription}
                          </div>
                          {item.problemDescription?.length > 80 && (
                            <button
                              type="button"
                              className="desc-expand-btn"
                              onClick={() => toggleDescription(item.id)}
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </td>
                        <td className="timestamp-cell">{formattedDate}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn-action-edit"
                              onClick={() => setEditingRequest({ ...item })}
                              title="Edit request details"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-action-delete"
                              onClick={() => setDeletingRequestId(item.id)}
                              title="Delete request"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================================
          EDIT MODAL DIALOG (PUT /api/requests/:id)
          ========================================================================= */}
      {editingRequest && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-dialog-title">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 id="edit-dialog-title" className="modal-title">
                Edit Request: <span className="ticket-id">{editingRequest.id}</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingRequest(null)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-studentName">
                    Student Name <span className="req-marker">*</span>
                  </label>
                  <input
                    id="edit-studentName"
                    type="text"
                    className="form-input"
                    value={editingRequest.studentName}
                    onChange={e =>
                      setEditingRequest(prev => ({ ...prev, studentName: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-email">
                    Student Email <span className="req-marker">*</span>
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    className="form-input"
                    value={editingRequest.email}
                    onChange={e =>
                      setEditingRequest(prev => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-category">
                      Category <span className="req-marker">*</span>
                    </label>
                    <select
                      id="edit-category"
                      className="form-select"
                      value={editingRequest.category}
                      onChange={e =>
                        setEditingRequest(prev => ({ ...prev, category: e.target.value }))
                      }
                      required
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-priority">
                      Priority <span className="req-marker">*</span>
                    </label>
                    <select
                      id="edit-priority"
                      className="form-select"
                      value={editingRequest.priority}
                      onChange={e =>
                        setEditingRequest(prev => ({ ...prev, priority: e.target.value }))
                      }
                      required
                    >
                      {PRIORITIES.map(lvl => (
                        <option key={lvl} value={lvl}>
                          {lvl} Priority
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-status">
                    Resolution Status <span className="req-marker">*</span>
                  </label>
                  <select
                    id="edit-status"
                    className="form-select"
                    value={editingRequest.status || 'Open'}
                    onChange={e =>
                      setEditingRequest(prev => ({ ...prev, status: e.target.value }))
                    }
                    required
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-description">
                    Problem Description <span className="req-marker">*</span>
                  </label>
                  <textarea
                    id="edit-description"
                    className="form-textarea"
                    rows={4}
                    value={editingRequest.problemDescription}
                    onChange={e =>
                      setEditingRequest(prev => ({
                        ...prev,
                        problemDescription: e.target.value
                      }))
                    }
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingRequest(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION DIALOG (DELETE /api/requests/:id)
          ========================================================================= */}
      {deletingRequestId && (
        <div
          className="modal-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 id="delete-dialog-title" className="modal-title">
                Confirm Ticket Deletion
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingRequestId(null)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-box">
                Are you sure you want to permanently delete ticket{' '}
                <strong>{deletingRequestId}</strong> from the campus registry? This action cannot be
                undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeletingRequestId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-solid"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <span>Campus Help Desk System • Assignment 4 Mini Project</span>
          <span>Node.js / Express ES Module + React Vite Fetch API</span>
        </div>
      </footer>
    </div>
  );
}
