
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

function format(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  valueFrom: string;
  valueTo: string;
  onChange: (from: string, to: string) => void;
};

export default function DateRangePicker({ valueFrom, valueTo, onChange }: Props) {
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const fromDate = new Date(valueFrom);
  const toDate = new Date(valueTo);

  const onChangeFrom = (_e: DateTimePickerEvent, date?: Date) => {
    setShowFrom(false);
    if (date) onChange(format(date), valueTo);
  };

  const onChangeTo = (_e: DateTimePickerEvent, date?: Date) => {
    setShowTo(false);
    if (date) onChange(valueFrom, format(date));
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: "600", marginBottom: 4 }}>Rango de fechas</Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => setShowFrom(true)}
          style={{ padding: 10, borderRadius: 10, backgroundColor: "#111827" }}
        >
          <Text style={{ color: "white" }}>Desde: {valueFrom}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowTo(true)}
          style={{ padding: 10, borderRadius: 10, backgroundColor: "#111827" }}
        >
          <Text style={{ color: "white" }}>Hasta: {valueTo}</Text>
        </Pressable>
      </View>

      {showFrom && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          onChange={onChangeFrom}
        />
      )}
      {showTo && (
        <DateTimePicker
          value={toDate}
          mode="date"
          onChange={onChangeTo}
        />
      )}
    </View>
  );
}
