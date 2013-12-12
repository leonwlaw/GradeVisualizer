/*********************************************
GradeVis table definitions

*********************************************/

CREATE TABLE IF NOT EXISTS users (
  u_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS classes (
  c_id INT AUTO_INCREMENT PRIMARY KEY,
  u_id INT NOT NULL REFERENCES users (u_id),
  name VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  c_id INT NOT NULL REFERENCES classes (c_id),
  a_id INT NOT NULL,
  name VARCHAR(32),
  score DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  CONSTRAINT assignment_pkey PRIMARY KEY (c_id, a_id)
);
