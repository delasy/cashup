#ifndef SRC_NETWORK_HPP
#define SRC_NETWORK_HPP

#include <cstddef>
#include <optional>
#include <string>
#include <vector>

#include "Math.hpp"
#include "Redis.hpp"

class Network {
 public:
  static float learningRate;
  static const std::vector<std::size_t> topology;

  static float activation (float);
  static float activationDerivative (float);
  static void train (Redis *, const std::vector<std::vector<float>> &, const std::vector<float> &);
  static std::vector<Matrix> unserialize (const std::string &);

  explicit Network (std::optional<std::vector<Matrix>>);

  void propagateBackward (float);
  void propagateForward (const Vector &);
  float result () const;
  std::string serialize () const;

 private:
  std::vector<Vector> _deltas;
  std::vector<Vector> _neurons;
  std::vector<Matrix> _weights;
};

#endif
