package services

import (
	"testing"
	"time"
)

func TestWaktuWIBSebagaiWallUTCConvertsAcrossDateBoundary(t *testing.T) {
	instant := time.Date(2026, time.September, 30, 20, 15, 0, 0, time.UTC)
	got := waktuWIBSebagaiWallUTC(instant)
	want := time.Date(2026, time.October, 1, 3, 15, 0, 0, time.UTC)

	if !got.Equal(want) {
		t.Fatalf("waktu WIB dalam format dinding = %s, ingin %s", got, want)
	}
}

func TestParseWaktuKeepsWIBScheduleAsNaiveWallClock(t *testing.T) {
	got, err := ParseWaktu("2026-10-01 09:30:00")
	if err != nil {
		t.Fatalf("ParseWaktu() error = %v", err)
	}
	want := time.Date(2026, time.October, 1, 9, 30, 0, 0, time.UTC)
	if !got.Equal(want) || got.Location() != time.UTC {
		t.Fatalf("ParseWaktu() = %s (%s), ingin waktu dinding %s UTC", got, got.Location(), want)
	}
}
