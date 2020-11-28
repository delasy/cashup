#include <random>
#include <stdexcept>

#include "Math.hpp"

Matrix::Matrix (const std::vector<std::vector<float>> &data) {
  this->_data = data;
}

Matrix::Matrix (std::size_t rows, std::size_t cols) {
  this->_data = std::vector<std::vector<float>>(rows, std::vector<float>(cols));
}

float &Matrix::operator() (std::size_t row, std::size_t col) {
  return this->_data[row][col];
}

const float &Matrix::operator() (std::size_t row, std::size_t col) const {
  return this->_data[row][col];
}

MatrixCol Matrix::col (std::size_t pos) {
  MatrixCol result(this->rows());

  for (std::size_t i = 0, size = this->rows(); i < size; i++) {
    result._data[i] = &this->_data[i][pos];
  }

  return result;
}

std::size_t Matrix::cols () const {
  return this->_data.empty() ? 0 : this->_data[0].size();
}

std::size_t Matrix::rows () const {
  return this->_data.size();
}

Matrix &Matrix::setRandom (float min, float max) {
  std::random_device rd;
  std::mt19937 rng(rd());
  std::uniform_real_distribution<float> dist(min, max);

  std::size_t sizeI = this->rows();
  std::size_t sizeJ = this->cols();

  for (std::size_t i = 0; i < sizeI; i++) {
    for (std::size_t j = 0; j < sizeJ; j++) {
      this->_data[i][j] = dist(rng);
    }
  }

  return *this;
}

Matrix Matrix::transpose () const {
  std::size_t sizeI = this->cols();
  std::size_t sizeJ = this->rows();

  Matrix result(sizeI, sizeJ);

  for (std::size_t i = 0; i < sizeI; i++) {
    for (std::size_t j = 0; j < sizeJ; j++) {
      result._data[i][j] = this->_data[j][i];
    }
  }

  return result;
}

MatrixCol::MatrixCol (std::size_t size) {
  this->_data = std::vector<float *>(size);
}

float &MatrixCol::operator[] (std::size_t pos) {
  return *this->_data[pos];
}

const float &MatrixCol::operator[] (std::size_t pos) const {
  return *this->_data[pos];
}

MatrixCol &MatrixCol::setZero () {
  for (auto &it : this->_data) {
    *it = 0.f;
  }

  return *this;
}

Vector::Vector (std::size_t size) {
  this->_data = std::vector<float>(size);
}

Vector::Vector (const std::vector<float> &data) {
  this->_data = data;
}

Vector Vector::operator* (const Matrix &data) const {
  if (this->size() != data.rows()) {
    throw std::invalid_argument("Incorrect dimensions for vector by matrix multiplication");
  }

  std::size_t sizeI = data.cols();
  std::size_t sizeJ = this->size();

  Vector result(sizeI);

  for (std::size_t i = 0; i < sizeI; i++) {
    for (std::size_t j = 0; j < sizeJ; j++) {
      result._data[i] += this->_data[j] * data._data[j][i];
    }
  }

  return result;
}

float &Vector::operator[] (std::size_t pos) {
  return this->_data[pos];
}

const float &Vector::operator[] (std::size_t pos) const {
  return this->_data[pos];
}

float Vector::dot (const Vector &data) const {
  if (this->size() != data.size()) {
    throw std::invalid_argument("Incorrect dimensions for dot product of vectors");
  }

  float result = 0;

  for (std::size_t i = 0, size = this->size(); i < size; i++) {
    result += this->_data[i] * data._data[i];
  }

  return result;
}

VectorRange Vector::range (std::size_t start, std::size_t end) {
  VectorRange result(end - start);

  for (std::size_t i = start; i < end; i++) {
    result._data[i - start] = &this->_data[i];
  }

  return result;
}

std::size_t Vector::size () const {
  return this->_data.size();
}

VectorRange::VectorRange (std::size_t size) {
  this->_data = std::vector<float *>(size);
}

VectorRange &VectorRange::operator= (const Vector &data) {
  if (this->_data.size() != data.size()) {
    throw std::invalid_argument("Incorrect dimensions for vector-range assignment");
  }

  for (std::size_t i = 0, size = this->_data.size(); i < size; i++) {
    *this->_data[i] = data._data[i];
  }

  return *this;
}

VectorRange &VectorRange::apply (const std::function<float (float)> &f) {
  for (auto &it : this->_data) {
    *it = f(*it);
  }

  return *this;
}
