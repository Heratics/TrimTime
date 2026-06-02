
TRIMTIME FINAL DATABASE SCHEMA v2

Includes:
- Users
- Shops
- Shop Hours
- Barbers
- Barber Schedules
- Barber Breaks
- Barber Time Off
- Services
- Products
- Appointments
- Notifications
- Gallery
- Google Maps Support

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 full_name VARCHAR(150) NOT NULL,
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 phone VARCHAR(30),
 role ENUM('admin','owner','barber') NOT NULL DEFAULT 'owner',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shops (
 id INT AUTO_INCREMENT PRIMARY KEY,
 owner_user_id INT NOT NULL,
 name VARCHAR(150) NOT NULL,
 slug VARCHAR(150) UNIQUE NOT NULL,
 description TEXT,
 phone VARCHAR(30),
 email VARCHAR(255),
 country VARCHAR(100) DEFAULT 'Jordan',
 city VARCHAR(100) DEFAULT 'Aqaba',
 district VARCHAR(100),
 address TEXT,
 latitude DECIMAL(10,8),
 longitude DECIMAL(11,8),
 google_maps_url TEXT,
 logo_url TEXT,
 cover_image_url TEXT,
 is_featured BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE shop_hours (
 id INT AUTO_INCREMENT PRIMARY KEY,
 shop_id INT NOT NULL,
 day_of_week INT NOT NULL,
 open_time TIME NOT NULL,
 close_time TIME NOT NULL,
 is_closed BOOLEAN DEFAULT FALSE,
 FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE barbers (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT,
 shop_id INT NOT NULL,
 full_name VARCHAR(150) NOT NULL,
 bio TEXT,
 profile_image_url TEXT,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE barber_schedule (
 id INT AUTO_INCREMENT PRIMARY KEY,
 barber_id INT NOT NULL,
 day_of_week INT NOT NULL,
 start_time TIME NOT NULL,
 end_time TIME NOT NULL,
 is_working BOOLEAN DEFAULT TRUE,
 FOREIGN KEY (barber_id) REFERENCES barbers(id)
);

CREATE TABLE barber_breaks (
 id INT AUTO_INCREMENT PRIMARY KEY,
 barber_id INT NOT NULL,
 day_of_week INT NOT NULL,
 break_start TIME NOT NULL,
 break_end TIME NOT NULL,
 reason VARCHAR(255),
 FOREIGN KEY (barber_id) REFERENCES barbers(id)
);

CREATE TABLE barber_time_off (
 id INT AUTO_INCREMENT PRIMARY KEY,
 barber_id INT NOT NULL,
 start_date DATE NOT NULL,
 end_date DATE NOT NULL,
 reason VARCHAR(255),
 FOREIGN KEY (barber_id) REFERENCES barbers(id)
);

CREATE TABLE services (
 id INT AUTO_INCREMENT PRIMARY KEY,
 shop_id INT NOT NULL,
 category VARCHAR(100),
 name VARCHAR(150) NOT NULL,
 description TEXT,
 duration_minutes INT NOT NULL,
 price DECIMAL(10,2) NOT NULL,
 is_active BOOLEAN DEFAULT TRUE,
 FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE products (
 id INT AUTO_INCREMENT PRIMARY KEY,
 shop_id INT NOT NULL,
 name VARCHAR(150) NOT NULL,
 description TEXT,
 price DECIMAL(10,2),
 image_url TEXT,
 stock_quantity INT DEFAULT 0,
 FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE appointments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 shop_id INT NOT NULL,
 barber_id INT NOT NULL,
 service_id INT NOT NULL,
 service_name VARCHAR(150),
 service_price DECIMAL(10,2),
 service_duration INT,
 customer_name VARCHAR(150) NOT NULL,
 customer_phone VARCHAR(30) NOT NULL,
 appointment_date DATE NOT NULL,
 appointment_time TIME NOT NULL,
 status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
 notes TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (shop_id) REFERENCES shops(id),
 FOREIGN KEY (barber_id) REFERENCES barbers(id),
 FOREIGN KEY (service_id) REFERENCES services(id)
	,
	UNIQUE KEY unique_barber_slot (barber_id, appointment_date, appointment_time)
);

CREATE TABLE notifications (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 title VARCHAR(255),
 message TEXT,
 is_read BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE gallery_images (
 id INT AUTO_INCREMENT PRIMARY KEY,
 shop_id INT NOT NULL,
 image_url TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE INDEX idx_shop_slug ON shops(slug);
CREATE INDEX idx_shop_city ON shops(city);
CREATE INDEX idx_shop_district ON shops(district);
CREATE INDEX idx_featured ON shops(is_featured);
