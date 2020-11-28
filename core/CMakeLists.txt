cmake_minimum_required(VERSION 3.0)
project(cashup VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EFLAGS "-pedantic -Wall -Wextra -Wold-style-cast -Wshadow -Wuninitialized -Wunreachable-code -Wunused")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${CMAKE_CXX_EFLAGS}")

set(
  SRC_FILES

  src/Math.cpp src/Math.hpp
  src/Network.cpp src/Network.hpp
  src/Redis.cpp src/Redis.hpp
)

find_path(HIREDIS_INCLUDE_DIRS hiredis)
find_library(HIREDIS_LIBRARIES hiredis)

add_executable(${PROJECT_NAME} ${SRC_FILES} data/data.hpp src/main.cpp)

target_include_directories(${PROJECT_NAME} SYSTEM PUBLIC ${HIREDIS_INCLUDE_DIRS})
target_link_libraries(${PROJECT_NAME} ${HIREDIS_LIBRARIES})
