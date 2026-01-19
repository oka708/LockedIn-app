const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lockedin_db')
    .then(() => console.log('MongoDB Terkoneksi'))
    .catch(err => console.log(err)); 
// --- Database Schema ---

// Schema untuk User (Login)
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', UserSchema);

// Schema untuk Data Password yang disimpan
const PasswordStoreSchema = new mongoose.Schema({
    userId: String,
    appName: String,
    username: String,
    passwordValue: String
});
const PasswordStore = mongoose.model('PasswordStore', PasswordStoreSchema);

// --- Routes (API) ---

// 1. Register
app.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true, message: 'Akun berhasil dibuat!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membuat akun' });
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.json({ success: true, userId: user._id, name: user.name });
    } else {
        res.json({ success: false, message: 'Email atau password salah' });
    }
});

// 3. Ambil Semua Password (Dashboard)
app.get('/passwords/:userId', async (req, res) => {
    const passwords = await PasswordStore.find({ userId: req.params.userId });
    res.json(passwords);
});

// 4. Simpan Password Baru
app.post('/passwords', async (req, res) => {
    const newPass = new PasswordStore(req.body);
    await newPass.save();
    res.json({ success: true });
});

// 5. Ambil 1 Password (untuk Edit)
app.get('/password-detail/:id', async (req, res) => {
    const pass = await PasswordStore.findById(req.params.id);
    res.json(pass);
});

// 6. Update Password
app.put('/passwords/:id', async (req, res) => {
    await PasswordStore.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
});

// 7. Hapus Password
app.delete('/passwords/:id', async (req, res) => {
    await PasswordStore.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});