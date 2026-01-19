const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- KONEKSI DATABASE SQLITE ---
// Database akan otomatis dibuat dalam file bernama 'database.sqlite'
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // File database tersimpan di sini
    logging: false // Mematikan log agar terminal bersih
});

// --- MODEL (SCHEMA) ---
// Pengganti Schema Mongoose

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }
});

const PasswordStore = sequelize.define('PasswordStore', {
    userId: { type: DataTypes.INTEGER }, 
    appName: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    passwordValue: { type: DataTypes.STRING }
});

// Sinkronisasi: Buat tabel jika belum ada
sequelize.sync().then(() => {
    console.log('Database SQLite Siap! File database.sqlite telah dibuat.');
});

// --- ROUTES (API) ---

// 1. Register
app.post('/register', async (req, res) => {
    try {
        await User.create(req.body);
        res.json({ success: true, message: 'Akun berhasil dibuat!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal/Email sudah ada' });
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });
    if (user) {
        // SQLite menggunakan 'id', bukan '_id'
        res.json({ success: true, userId: user.id, name: user.name });
    } else {
        res.json({ success: false, message: 'Email atau password salah' });
    }
});

// 3. Ambil Semua Password
app.get('/passwords/:userId', async (req, res) => {
    const passwords = await PasswordStore.findAll({ where: { userId: req.params.userId } });
    res.json(passwords);
});

// 4. Simpan Password Baru
app.post('/passwords', async (req, res) => {
    await PasswordStore.create(req.body);
    res.json({ success: true });
});

// 5. Ambil 1 Password (Detail)
app.get('/password-detail/:id', async (req, res) => {
    const pass = await PasswordStore.findByPk(req.params.id);
    res.json(pass);
});

// 6. Update Password
app.put('/passwords/:id', async (req, res) => {
    await PasswordStore.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
});

// 7. Hapus Password
app.delete('/passwords/:id', async (req, res) => {
    await PasswordStore.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});