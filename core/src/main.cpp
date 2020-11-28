#include <cstdlib>
#include <vector>

#include "Network.hpp"
#include "Redis.hpp"
#include "../data/data.hpp"

#define SHIFT 5

int main () {
  std::vector<std::vector<float>> input(DATA_SIZE - SHIFT);
  std::vector<float> result(DATA_SIZE - SHIFT);

  for (std::size_t i = SHIFT; i < DATA_SIZE; i++) {
    input[i - SHIFT] = {
      data[i - 1][4],
      data[i - 2][4],
      data[i - 3][4],
      data[i - 4][4],
      data[i - 5][4]
    };

    result[i - SHIFT] = data[i][4];
  }

  Redis redis("redis://127.0.0.1:6379");
  Network::train(&redis, input, result);

  return EXIT_SUCCESS;
}
