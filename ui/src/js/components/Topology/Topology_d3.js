var graph = {
    "nodes": [
        {"id": "00:00:00:00:0f", "type": "host"},
        {"id": "00:00:00:00:0a", "type": "host"},
        {"id": "00:00:00:00:0b", "type": "device"},
        {"id": "00:00:00:00:0c", "type": "host"},
        {"id": "00:00:00:00:0d", "type": "host"},
        {"id": "00:00:00:00:0e", "type": "device"},
        {"id": "00:00:00:00:01", "type": "device"},
        {"id": "00:00:00:00:02", "type": "switch"},
        {"id": "00:00:00:00:03", "type": "switch"},
        {"id": "00:00:00:00:04", "type": "switch"},
        {"id": "00:00:00:00:05", "type": "switch"},
        {"id": "00:00:00:00:06", "type": "switch"},
        {"id": "00:00:00:00:07", "type": "switch"}
      ],
    "links": [
      {"source":  0, "target": 8},
      {"source":  1, "target": 8},
      {"source":  2, "target": 8},
      {"source":  3, "target": 9},
      {"source":  4, "target": 10},
      {"source":  5, "target": 11},
      {"source":  6, "target": 12},
      {"source":  7, "target": 12},
      {"source":  8, "target": 10},
      {"source":  8, "target": 9},
      {"source":  9, "target": 10},
      {"source": 10, "target": 11},
      {"source": 11, "target": 12},
      {"source": 12, "target": 9}
    ]
};
module.exports = graph;
