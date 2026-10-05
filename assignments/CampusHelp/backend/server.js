import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'requests.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initial seed data if requests.json does not exist
const initialSeedRequests = [
  {
    id: "REQ-1001",
    studentName: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    category: "IT & Network Support",
    problemDescription: "High-latency and intermittent disconnects on Eduroam Wi-Fi in the Central Library Level 2 study hall.",
    priority: "High",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "REQ-1002",
    studentName: "Maya Chen",
    email: "m.chen@campus.edu",
    category: "Facilities & Maintenance",
    problemDescription: "HVAC thermostat unit in Science Quad Lab 304 is stuck at 16°C and causing condensation on glassware.",
    priority: "Medium",
    status: "Open",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "REQ-1003",
    studentName: "David Kalu",
    email: "david.kalu@campus.edu",
    category: "Hostel & Housing",
    problemDescription: "North Hall Room 112 door latch sticking intermittently; requires manual jiggle to lock from outside.",
    priority: "Urgent",
    status: "Open",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: "REQ-1004",
    studentName: "Sophia Rodriguez",
    email: "s.rodriguez@campus.edu",
    category: "Academic Services",
    problemDescription: "Course portal syllabus link for CS-401 returns 404 error prior to Friday submission window.",
    priority: "Low",
    status: "Resolved",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// Helper: Ensure requests.json exists
async function ensureDataFile() {
  try {
    if (!existsSync(DATA_FILE)) {
      await fs.writeFile(DATA_FILE, JSON.stringify(initialSeedRequests, null, 2), 'utf-8');
      console.log('Initialized requests.json with initial campus records.');
    }
  } catch (error) {
    console.error('Error initializing requests.json:', error);
  }
}

// Helper: Read all requests
async function readRequests() {
  await ensureDataFile();
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading requests.json:', error);
    return [];
  }
}

// Helper: Write all requests
async function writeRequests(requests) {
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), 'utf-8');
}

// Helper: Generate next ticket ID
function generateTicketId(existingRequests) {
  const currentYear = new Date().getFullYear();
  const numericIds = existingRequests
    .map(r => {
      const match = String(r.id).match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1000;
  return `REQ-${maxId + 1}`;
}

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------

// Health / Status
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET /api/requests - Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await readRequests();
    // Sort newest first by default
    const sorted = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve requests', details: error.message });
  }
});

// GET /api/requests/:id - Get single request by id
app.get('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await readRequests();
    const request = requests.find(r => String(r.id).toLowerCase() === String(id).toLowerCase());

    if (!request) {
      return res.status(404).json({ error: `Request with ID "${id}" was not found.` });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request', details: error.message });
  }
});

// POST /api/requests - Create a new request
app.post('/api/requests', async (req, res) => {
  try {
    const { studentName, email, category, problemDescription, priority } = req.body;

    // Strict validation
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'Student Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Student Email is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    if (!problemDescription || !problemDescription.trim()) {
      return res.status(400).json({ error: 'Problem Description is required.' });
    }
    if (!priority || !priority.trim()) {
      return res.status(400).json({ error: 'Priority is required.' });
    }

    const requests = await readRequests();
    const newId = generateTicketId(requests);

    const now = new Date().toISOString();
    const newRequest = {
      id: newId,
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      category: category.trim(),
      problemDescription: problemDescription.trim(),
      priority: priority.trim(),
      status: req.body.status && req.body.status.trim() ? req.body.status.trim() : 'Open',
      createdAt: now,
      updatedAt: now
    };

    requests.push(newRequest);
    await writeRequests(requests);

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit request', details: error.message });
  }
});

// PUT /api/requests/:id - Update an existing request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, email, category, problemDescription, priority, status } = req.body;

    const requests = await readRequests();
    const index = requests.findIndex(r => String(r.id).toLowerCase() === String(id).toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: `Request with ID "${id}" was not found.` });
    }

    const existing = requests[index];

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
    }

    const updatedRequest = {
      ...existing,
      studentName: studentName !== undefined ? studentName.trim() : existing.studentName,
      email: email !== undefined ? email.trim().toLowerCase() : existing.email,
      category: category !== undefined ? category.trim() : existing.category,
      problemDescription: problemDescription !== undefined ? problemDescription.trim() : existing.problemDescription,
      priority: priority !== undefined ? priority.trim() : existing.priority,
      status: status !== undefined ? status.trim() : (existing.status || 'Open'),
      updatedAt: new Date().toISOString()
    };

    requests[index] = updatedRequest;
    await writeRequests(requests);

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request', details: error.message });
  }
});

// DELETE /api/requests/:id - Delete a request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await readRequests();
    const index = requests.findIndex(r => String(r.id).toLowerCase() === String(id).toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: `Request with ID "${id}" was not found.` });
    }

    const deletedRequest = requests[index];
    requests.splice(index, 1);
    await writeRequests(requests);

    res.status(200).json({
      message: `Request ${id} deleted successfully.`,
      deletedRequest
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request', details: error.message });
  }
});

// Serve static frontend build if present
const frontendDist = path.join(__dirname, '../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Express Server
await ensureDataFile();
app.listen(PORT, () => {
  console.log(`[Campus Help Desk API] Server running on http://localhost:${PORT}`);
});

