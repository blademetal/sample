import React, { FC, useMemo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVideosStore } from '../../stores/videos';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'react-feather';
import clsx from 'clsx';
import { hideCursor, showCursor } from '../../lib/displayUtils';

export const Search: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videos = useVideosStore((state) => state.videos);
  const setSelectedVideo = useVideosStore((state) => state.setSelectedVideo);
  const setResultVideos = useVideosStore((state) => state.setResultVideos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const handleOutsideSearchBoxClick = useCallback(() => {
    setIsSearchActive(false);
    showCursor();
  }, []);

  useClickOutside(searchBoxRef, handleOutsideSearchBoxClick);

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const handleSelectVideo = useCallback(
    (video) => {
      setSelectedVideo(video);
      setIsSearchActive(false);
      navigate(`/player/${video._id}`);
    },
    [setSelectedVideo]
  );

  const handleSearchButtonClicked = useCallback(() => {
    setResultVideos(filteredVideos);
    setIsSearchActive(true);
    navigate('/results');
  }, [filteredVideos, setResultVideos]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        if (selectedItemId) {
          showCursor();
          const selectedLocalVideo = videos.find(
            (video) => video._id === selectedItemId
          );
          if (selectedLocalVideo) {
            handleSelectVideo(selectedLocalVideo);
          }
        } else {
          handleSearchButtonClicked();
        }
      }
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsSearchActive(false);
      }
    },
    [handleSearchButtonClicked, selectedItemId, videos, handleSelectVideo]
  );

  const handleSearchBoxKeyDown = useCallback(
    (event) => {
      const maxIndex =
        (filteredVideos.length <= 10 ? filteredVideos.length : 10) - 1;
      if (event.key === 'ArrowUp') {
        hideCursor();
        const selectedItemIndex = filteredVideos.findIndex(
          (video) => video._id === selectedItemId
        );
        if (selectedItemIndex === 0) {
          setSelectedItemId(filteredVideos[maxIndex]._id);
        }
        if (selectedItemIndex > 0) {
          setSelectedItemId(filteredVideos[selectedItemIndex - 1]._id);
        }
      }
      if (event.key === 'ArrowDown') {
        hideCursor();
        const selectedItemIndex = filteredVideos.findIndex(
          (video) => video._id === selectedItemId
        );
        if (selectedItemIndex === -1) {
          setSelectedItemId(filteredVideos[0]._id);
        }
        if (selectedItemIndex < maxIndex) {
          setSelectedItemId(filteredVideos[selectedItemIndex + 1]._id);
        }
        if (selectedItemIndex === maxIndex) {
          setSelectedItemId(filteredVideos[0]._id);
        }
      }
    },
    [handleSearchButtonClicked, selectedItemId, filteredVideos]
  );

  return (
    <>
      <div
        ref={searchBoxRef}
        className="relative focus:outline-red-600"
        onKeyDown={handleSearchBoxKeyDown}
      >
        <div className="flex flex-row rounded-full overflow-hidden bg-green-300">
          <input
            className="bg-gray-100 text-gray-600 py-1 px-4 focus:outline-none w-full lg:w-[28rem] focus:shadow-outline"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchActive(true)}
            onKeyDown={handleKeyDown}
          />
          <button
            title="Search"
            onClick={handleSearchButtonClicked}
            className="py-1 pl-3 pr-4 flex items-center justify-end bg-red-600 hover:bg-red-700"
          >
            <SearchIcon className="text-white" size={20} />
          </button>
        </div>
        {isSearchActive && (
          <div className="absolute left-0 top-9 py-2 w-full bg-white overflow-hidden shadow-lg rounded-lg z-10">
            {filteredVideos.length > 0 ? (
              filteredVideos.map(
                (video, index) =>
                  index < 10 && (
                    <button
                      key={video._id}
                      className={clsx(
                        'flex flex-row w-full items-center justify-start text-start px-4 py-2 hover:bg-gray-100',
                        {
                          'bg-gray-100': selectedItemId === video._id,
                        }
                      )}
                      onClick={() => handleSelectVideo(video)}
                    >
                      <SearchIcon
                        className="text-gray-600 mr-2 lg:mr-4"
                        size={16}
                      />
                      <span className="text-gray-600 text-sm font-semibold truncate">
                        {video.title}
                      </span>
                    </button>
                  )
              )
            ) : (
              <div className="flex flex-row w-full items-center px-4 py-2">
                <SearchIcon className="text-gray-600 mr-4" size={16} />
                <span className="text-gray-600 text-sm font-semibold">
                  {t('search:noResultsFound')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
