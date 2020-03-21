TMP_DIR = tmp
TARGET  = server

all:
	mkdir -p $(TMP_DIR)
	cd triangulation && $(MAKE)
	go build -o $(TARGET)

.PHONY: clean
clean:
	cd triangulation && $(MAKE) clean
	rm -rf $(TARGET)
	rm -rf $(TMP_DIR)
