# Logic by Vivek Jayaram
# Essentially the same as pychorus project by Vivek Jayaram except with different chorus returned. 
# Instead of returning by best match, program returns by earliest detected chorus time. Had to 
# rewrite some methods to do that.

import numpy as np
import os

from pytube import YouTube
import librosa
import librosa.display
from moviepy.editor import *

from pychorus import find_and_output_chorus
import pychorus.helpers
import pychorus.similarity_matrix


def get_file(url):
    video_link = url
    video = YouTube(video_link)
    audio = video.streams.filter(only_audio=True, file_extension='mp4').first()
    if not os.path.exists('./audio/' + video.title + '.mp3'):
        audio.download('./audio')
        print('downloading audio files . . .')
        mp4_without_frames = AudioFileClip('./audio/' + video.title + '.mp4')
        mp4_without_frames.write_audiofile('./audio/' + video.title + '.mp3')
        mp4_without_frames.close()
        os.remove('./audio/' + video.title + '.mp4')
    print('finding start time . . .')
    start_time = int(return_chorus('./audio/' + video.title + '.mp3'))
    print('found start time.')
    return start_time

def best_segment(line_scores):
    lines_to_sort = []
    for line in line_scores:
        lines_to_sort.append((line, line_scores[line], line.start))

    lines_to_sort.sort(key=lambda x: (x[2]))
    best_tuple = lines_to_sort[0]
    return best_tuple[0]


def find_first_chorus(time_lag_similarity, time_time_similarity, num_samples, song_length):
    chroma_sr = num_samples / song_length
    smoothing_size_samples = int(2.5 * chroma_sr)
    time_lag_similarity.denoise(time_time_similarity.matrix,
                                smoothing_size_samples)

    # Detect lines in the image using pychorus
    clip_length_samples = 10 * chroma_sr
    candidate_rows = pychorus.helpers.local_maxima_rows(time_lag_similarity.matrix)
    lines = pychorus.helpers.detect_lines(time_lag_similarity.matrix, candidate_rows,
                         clip_length_samples)
    if len(lines) == 0:
        return 0
    line_scores = pychorus.helpers.count_overlapping_lines(
        lines, 0.2 * clip_length_samples,
        clip_length_samples)
    best_chorus = best_segment(line_scores)
    return best_chorus.start / chroma_sr


def return_chorus(audio_file):
    y, sr = librosa.load(audio_file)
    song_length = y.shape[0] / float(sr)

    S = np.abs(librosa.stft(y, n_fft=4096))**2
    chroma = librosa.feature.chroma_stft(S=S, sr=sr)
    time_time_similarity = pychorus.similarity_matrix.TimeTimeSimilarityMatrix(chroma, sr)
    time_lag_similarity = pychorus.similarity_matrix.TimeLagSimilarityMatrix(chroma, sr)
    num_samples = chroma.shape[1]

    start = find_first_chorus(time_lag_similarity, time_time_similarity, num_samples, song_length)
    if start is None:
        return 0
    else:
        return start