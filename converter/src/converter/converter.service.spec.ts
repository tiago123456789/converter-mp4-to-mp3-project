import { NewFileConverterMessage } from 'src/common/queue/messages/new-file-converter.message';
import { ConverterService } from './converter.service';
import { QueuePublisher } from 'src/common/adapters/queue/queue-publisher';
import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';
import { FileRepositoryInterface } from './repositories/file-repository.interface';
import { Mp3ConvertedRepositoryInterface } from './repositories/mp3-converted-repository.interface';
import { TrackerIdInterface } from 'src/common/adapters/tracker-id.interface';
import { Mp3ConverterDocument } from './mp3-converter.schema';
import mongoose from 'mongoose';
import * as fs from 'fs';

describe('ConverterService', () => {
  let convertMp4ToMp3Queue: jest.Mocked<
    QueuePublisher<NewFileConverterMessage>
  >;
  let convertionCompleteQueue: jest.Mocked<
    QueuePublisher<ConvertionSuccessMessage>
  >;
  let fileRepository: jest.Mocked<FileRepositoryInterface>;
  let mp3ConverterModel: jest.Mocked<Mp3ConvertedRepositoryInterface>;
  let tracker: jest.Mocked<TrackerIdInterface>;
  let logger: jest.Mocked<LoggerInterface>;
  let fakeFileInfo = {
    _id: 'teste',
    filename: 'teste',
    length: 10,
    chunkSize: 5,
    md5: 'asdfas',
    contentType: 'audio/mp3',
    uploadDate: new Date(),
    metadata: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fakeFileInfo = {
      _id: 'teste',
      filename: 'teste',
      length: 10,
      chunkSize: 5,
      md5: 'asdfas',
      contentType: 'audio/mp3',
      uploadDate: new Date(),
      metadata: {},
    };

    fileRepository = {
      findById: jest.fn(),
      readStream: jest.fn(),
      writeFileStream: jest.fn(),
    };

    convertMp4ToMp3Queue = {
      publish: jest.fn(),
      // @ts-ignore
      queue: {},
    };

    tracker = {
      id: jest.fn(),
    };

    mp3ConverterModel = {
      deleteManyLessThanDate: jest.fn(),
      findByUserId: jest.fn(),
      insertMany: jest.fn(),
    };

    logger = {
      error: jest.fn(),
      info: jest.fn(),
    };
  });

  it('Should be get mp3 file stream with success', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    const fakeId = '360cf552-c3ef-4f9e-a982-b43b8ba6b028';
    await converterService.readStream(fakeId);
    expect(fileRepository.readStream).toBeCalledTimes(1);
  });

  it('Should be throw exception when try get mp3 file by id, but file not exits', async () => {
    try {
      const converterService = new ConverterService(
        convertMp4ToMp3Queue,
        convertionCompleteQueue,
        fileRepository,
        mp3ConverterModel,
        tracker,
        logger,
      );

      fileRepository.findById.mockResolvedValue(Promise.resolve(null));
      const fakeId = '360cf552-c3ef-4f9e-a982-b43b8ba6b028';
      await converterService.findInfo(fakeId);
    } catch (error) {
      expect(error.message).toBe('File not found');
    }
  });

  it('Should be get mp3 file by id with success', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    fileRepository.findById.mockResolvedValue(Promise.resolve(fakeFileInfo));
    const fakeId = '360cf552-c3ef-4f9e-a982-b43b8ba6b028';
    await converterService.findInfo(fakeId);
    expect(fileRepository.findById).toBeCalledTimes(1);
  });

  it('Should be publish in queue new file to convert mp4 to mp3 file with success', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    const fakeId = '360cf552-c3ef-4f9e-a982-b43b8ba6b028';
    await converterService.save({
      id: fakeId,
      user: {
        email: 'test@gmail.com',
        id: 1,
      },
    });
    expect(convertMp4ToMp3Queue.publish).toBeCalledTimes(1);
    expect(tracker.id).toBeCalledTimes(1);
  });

  it('Should be return mp3 converted empty for user, because user no converterd any mp4 file', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    mp3ConverterModel.findByUserId.mockResolvedValue(Promise.resolve([]));
    const fakeId = 1;
    const results = await converterService.getMp3ConvertedByUserId(fakeId);
    expect(results.length).toBe(0);
  });

  it('Should be return mp3 converted the user with success', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    // @ts-ignore
    const fakeMp3Converted: Mp3ConverterDocument = {
      _id: new mongoose.Types.ObjectId('64cfe17e2b62592623801e95'),
      userId: '1',
      fileId: '1',
      createdAt: new Date(),
    };
    mp3ConverterModel.findByUserId.mockResolvedValue(
      Promise.resolve([fakeMp3Converted]),
    );
    const fakeId = 1;
    const results = await converterService.getMp3ConvertedByUserId(fakeId);
    expect(results.length).toBe(1);
    expect(results[0].userId).toBe(Number(fakeMp3Converted.userId));
    expect(results[0].createdAt).toBe(fakeMp3Converted.createdAt);
    expect(results[0].createdAt).toBe(fakeMp3Converted.createdAt);
    expect(results[0].link).toBe(
      `${process.env.LINK_FILE}${fakeMp3Converted.fileId}`,
    );
  });

  it('Should be remove mp3 file converted after 30 day with success', async () => {
    const converterService = new ConverterService(
      convertMp4ToMp3Queue,
      convertionCompleteQueue,
      fileRepository,
      mp3ConverterModel,
      tracker,
      logger,
    );

    await converterService.removeMp3ConvertedAfter30Days();
    expect(mp3ConverterModel.deleteManyLessThanDate).toBeCalledTimes(1);
    expect(logger.error).toBeCalledTimes(0);
  });

  it('Should be throw error when try remove mp3 file converted after 30 day', async () => {
    try {
      const converterService = new ConverterService(
        convertMp4ToMp3Queue,
        convertionCompleteQueue,
        fileRepository,
        mp3ConverterModel,
        tracker,
        logger,
      );

      mp3ConverterModel.deleteManyLessThanDate.mockImplementation(() => {
        throw new Error('Error when try delete mp3 files');
      });
      await converterService.removeMp3ConvertedAfter30Days();
    } catch (error) {
      expect(mp3ConverterModel.deleteManyLessThanDate).toBeCalledTimes(1);
      expect(logger.error).toBe(1);
    }
  });

  it('Should be throw exception when try convert mp4 file not exist', async () => {
    try {
      const converterService = new ConverterService(
        convertMp4ToMp3Queue,
        convertionCompleteQueue,
        fileRepository,
        mp3ConverterModel,
        tracker,
        logger,
      );

      fileRepository.findById.mockReturnValue(Promise.resolve(null));
      const fakeMessage: NewFileConverterMessage = {
        id: '1',
        user: {
          email: 'fake@gmail.com',
          id: 1,
        },
        trackId: '471bace2-bd92-44fa-9bf3-f4b7f0a55156',
      };
      await converterService.convertMp4ToMp3(fakeMessage);
    } catch (error) {
      expect(error.message).toBe('File not found');
    }
  });

  it('Should be throw exception when try convert file is not mp4', async () => {
    try {
      const converterService = new ConverterService(
        convertMp4ToMp3Queue,
        convertionCompleteQueue,
        fileRepository,
        mp3ConverterModel,
        tracker,
        logger,
      );

      fileRepository.findById.mockReturnValue(Promise.resolve(fakeFileInfo));
      const fakeMessage: NewFileConverterMessage = {
        id: '1',
        user: {
          email: 'fake@gmail.com',
          id: 1,
        },
        trackId: '471bace2-bd92-44fa-9bf3-f4b7f0a55156',
      };
      await converterService.convertMp4ToMp3(fakeMessage);
    } catch (error) {
      expect(error.message).toBe(
        'Error caused by: try convert 1.mp3 file but you only can convert mp4',
      );
    }
  });
});
