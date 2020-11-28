#ifndef SRC_MATH_HPP
#define SRC_MATH_HPP

#include <cstddef>
#include <functional>
#include <vector>

class Matrix;
class MatrixCol;
class Vector;
class VectorRange;

class Matrix {
 public:
  explicit Matrix (std::size_t, std::size_t);
  Matrix (const std::vector<std::vector<float>> &);
  float &operator() (std::size_t, std::size_t);
  const float &operator() (std::size_t, std::size_t) const;

  MatrixCol col (std::size_t);
  std::size_t cols () const;
  std::size_t rows () const;
  Matrix &setRandom (float, float);
  Matrix transpose () const;

 private:
  friend class MatrixCol;
  friend class Vector;
  friend class VectorRange;

  std::vector<std::vector<float>> _data;
};

class MatrixCol {
 public:
  explicit MatrixCol (std::size_t);
  float &operator[] (std::size_t);
  const float &operator[] (std::size_t) const;

  MatrixCol &setZero ();

 private:
  friend class Matrix;
  friend class Vector;
  friend class VectorRange;

  std::vector<float *> _data;
};

class Vector {
 public:
  explicit Vector (std::size_t);
  Vector (const std::vector<float> &);
  Vector operator* (const Matrix &) const;
  float &operator[] (std::size_t);
  const float &operator[] (std::size_t) const;

  float dot (const Vector &) const;
  VectorRange range (std::size_t, std::size_t);
  std::size_t size () const;

 private:
  friend class Matrix;
  friend class MatrixCol;
  friend class VectorRange;

  std::vector<float> _data;
};

class VectorRange {
 public:
  explicit VectorRange (std::size_t);
  VectorRange &operator= (const Vector &);

  VectorRange &apply (const std::function<float (float)> &);

 private:
  friend class Matrix;
  friend class MatrixCol;
  friend class Vector;

  std::vector<float *> _data;
};

#endif
