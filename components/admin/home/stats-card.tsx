"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const StatsCard = ({
  label,
  number,
}: {
  label: string;
  number: number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold">{number}</p>
      </CardContent>
    </Card>
  );
};
