-- Create database
CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    gender ENUM('Male', 'Female', 'Other'),
    location VARCHAR(255),
    role ENUM('User', 'Admin') DEFAULT 'User',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    event_type ENUM('Wedding', 'Birthday Party', 'Baby Shower') NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    location VARCHAR(255) NOT NULL,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    description TEXT,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);

-- Event photos table
CREATE TABLE event_photos (
    photo_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Packages table
CREATE TABLE packages (
    package_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Booking requests table
CREATE TABLE booking_requests (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    package_id INT,
    status ENUM('Pending', 'Confirmed', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    booking_date DATE,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (package_id) REFERENCES packages(package_id)
);

-- OTP verification table
CREATE TABLE otp_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (mobile_number, name, role, is_verified) VALUES ('9999999999', 'Admin', 'Admin', TRUE);
