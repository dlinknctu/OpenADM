#
# Copyright (C) 2013 TeYen Liu
#

TREMA = ../bin

CC = gcc
AR = ar
RANLIB = ranlib

TREMA_CONFIG = $(shell which trema-config)
ifeq ($(TREMA_CONFIG),)
  TREMA_CONFIG = $(TREMA)/trema-config
endif

CFLAGS = $(shell $(TREMA_CONFIG) --cflags) -std=gnu99 -D_GNU_SOURCE -g -fno-strict-aliasing -Wall -Wextra -Wformat=2 -Wcast-qual -Wcast-align -Wwrite-strings -Wconversion -Wfloat-equal -Wpointer-arith

LIB = libtrema_restapi_manager.a
SRCS = simple_restapi_manager.c librestapi.c mongoose.c
OBJS = $(SRCS:.c=.o)

TARGET = $(LIB)

SOURCE = src

DEPENDS = .depends

.PHONY: all depend clean uds

.SUFFIXES: .c .o

all: depend $(TARGET) uds

$(TARGET): $(OBJS)
	$(AR) -cq $@ $(OBJS)
	$(RANLIB) $@

.c.o:
	$(CC) $(CFLAGS) -c $<

depend:
	$(CC) -MM $(CFLAGS) $(SRCS) > $(DEPENDS)

clean:
	@rm -rf $(DEPENDS) $(OBJS) $(TARGET) *~

uds:
	cd $(SOURCE) && $(MAKE)

-include $(DEPENDS)
