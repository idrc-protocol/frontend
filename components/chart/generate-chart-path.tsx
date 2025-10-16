interface DataPoint {
  timestamp: number;
  close: number;
}

export const generateChartPath = (
  data: number[] | DataPoint[],
  width: number,
  height: number,
): { linePath: string; areaPath: string } => {
  if (!data.length) return { linePath: "", areaPath: "" };

  const isTimestampData = typeof data[0] === "object" && "timestamp" in data[0];

  const values = isTimestampData
    ? (data as DataPoint[]).map((d) => d.close)
    : (data as number[]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  let points: number[][];

  if (isTimestampData) {
    const timestamps = (data as DataPoint[]).map((d) => d.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime || 1;

    points = (data as DataPoint[]).map((item) => {
      const x = ((item.timestamp - minTime) / timeRange) * width;
      const y = height - ((item.close - min) / range) * height;

      return [x, y];
    });
  } else {
    const stepX = width / (data.length - 1);

    points = values.map((value, idx) => {
      const x = idx * stepX;
      const y = height - ((value - min) / range) * height;

      return [x, y];
    });
  }

  const linePath = "M" + points.map(([x, y]) => `${x},${y}`).join("L");

  const areaPath = linePath + `L${width},${height}L0,${height}Z`;

  return { linePath, areaPath };
};
