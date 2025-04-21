# Compiler and flags
CC = gcc
CFLAGS = -Wall -Wextra -I../gui
LDFLAGS = -lraylib -lGL -lm -lpthread -ldl

# Directories
SRC_DIR = .
GUI_DIR = ../gui
BUILD_DIR = ../build

# Source files
SRC_FILES = $(SRC_DIR)/main.c
GUI_FILES = $(GUI_DIR)/ui.c
OBJ_FILES = $(SRC_FILES:.c=.o) $(GUI_FILES:.c=.o)

# Executable name
TARGET = $(BUILD_DIR)/asm-visualizer

# Default target
all: setup $(TARGET)

# Setup build directory
setup:
	mkdir -p $(BUILD_DIR)

# Linking
$(TARGET): $(OBJ_FILES)
	$(CC) $^ -o $@ $(LDFLAGS)

# Compiling
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean
clean:
	rm -f $(OBJ_FILES) $(TARGET)
	rm -rf $(BUILD_DIR)

# Phony targets
.PHONY: all clean setup
