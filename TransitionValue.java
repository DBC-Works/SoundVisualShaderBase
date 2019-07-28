public final class TransitionValue {
    public final float first;
    public final float last;
    public final int step;

    private float nextValue;
    private float position;

    public TransitionValue(float firstValue, float lastValue, int stepValue) {
        first = firstValue;
        last = lastValue;
        step = stepValue;

        nextValue = first;
        position = 0;
    }

    public float next() {
        final float value = nextValue;
        if (hasNext()) {
            ++position;
            nextValue = calc();
        }

        return value;
    }

    public boolean hasNext() {
        return position <= step;
    }

    public void reset() {
        nextValue = first;
        position = 0;
    }

    private float calc() {
        return first + ((last - first) * (position / (float)step));
    }
}