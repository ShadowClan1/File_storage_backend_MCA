const express = require("express");
const { Dir, File, sequelize } = require("../database/models");
const { STATUS_CODES } = require("../constants/constants");
const { multerInstance } = require("../middlewares/multer");
const router = express.Router();

router.post("/upload", multerInstance.array("files", 100), async (req, res) => {
  let { parentDir, ownerId = 1 } = req.body;
  if (parentDir == 0) parentDir = null;
  try {
    let temp = req.files;
    const data = [];
    if (Array.isArray(temp)) {
      for (let i = 0; i < temp.length; i++) {
        data.push(
          await File.create({
            name: temp[i].originalname,
            size: temp[i].size,
            object_key: temp[i].filename,
            object_url: "http://localhost:5000/" + temp[i].filename,
            mime_type: temp[i].mimetype,
            parent_dir: parentDir,
            owner_id: ownerId,
          })
        );
      }
    }

    res
      .status(STATUS_CODES.GOOD)
      .json({ message: "files has been uploaded", files: data });
  } catch (error) {
    res.status(STATUS_CODES.SEVERERR).json({ message: "failed" });
  }
});

router.post("/createDir", async (req, res) => {
  let { ownerId = 1, name, parentDir } = req.body;
  try {
    const dir = await Dir.create({
      name,
      parent_dir: parentDir != 0 ? parentDir : null,
      owner_id: ownerId,
    });
    dir.dataValues.type = "folder";
    dir.dataValues.size = 0;

    res.status(STATUS_CODES.GOOD).json({ dir });
  } catch (error) {
    res
      .status(STATUS_CODES.SEVERERR)
      .json({ message: error.message, success: false });
  }
});
router.get("/dir", async (req, res) => {
  let ownerId = 1;
  let { q } = req.query;
  if (q == 0) q = null;
  try {
    const files = await File.findAll({
      where: { parent_dir: q, owner_id: ownerId },
      attributes: [
        "id",
        "name",
        ["object_url", "objectURL"],
        ["object_key", "objectKey"],
        "size",
        [sequelize.literal("'file'"), "type"],
        ["created_at", "createdAt"],
        ["updated_at", "updatedAt"],
        ["parent_dir", "parentDir"],
        ["mime_type", "mimeType"],
      ],
    });
    const folders = await Dir.findAll({
      where: { parent_dir: q, owner_id: ownerId },
      attributes: [
        "id",
        "name",
        "size",
        [sequelize.literal("'folder'"), "type"],
        "createdAt",
        "updatedAt",
        ["parent_dir", "parentDir"],
      ],
    });

    const dirs = [...folders, ...files];

    console.log(dirs, "these are the files");
    res.status(STATUS_CODES.GOOD).json({ dirs });
  } catch (error) {
    res
      .status(STATUS_CODES.SEVERERR)
      .json({ message: error.message, success: false });
  }
});
router.post("/delete", async (req, res) => {
  try {
    let { array } = req.body;
    console.log(array, "to delete");

    for (let element of array) {
      let { type, id, objectKey, ownerId = 1 } = element;
      if (type == "file") {
        await File.destroy({
          where: { id, owner_id: ownerId, object_key: objectKey },
        });
      } else if (type == "folder") {
        await Dir.destroy({ where: { id, owner_id: ownerId } });
        recursionDelete(id);
      }
    }
    return res.status(STATUS_CODES.GOOD).json({ success: "true" });
  } catch (error) {
    res
      .status(STATUS_CODES.SEVERERR)
      .json({ message: error.message, success: false });
  }
});
router.post("/paste", async (req, res) => {
  try {
    let { files, type, parentDir, ownerId = 1 } = req.body;
    if(parentDir ===0) parentDir = null
    console.log(files, "to delete", type, parentDir);
    let data = [];
    for (let element of files) {
      let { type: fileType, id, objectKey } = element;
      if (fileType == "file") {
        if (type === "MOVE") {
          await File.update(
            { parent_dir: parentDir },
            { where: { id, object_key: objectKey, owner_id: ownerId } }
          );
        } else if (type === "COPY") {
          const existingFile = await File.findOne({
            where: { id, object_key: key, owner_id: ownerId },
          });
          if (!existingFile) continue;
          const newFile = await File.build({ ...existingFile.get(), id: null , parent_dir : parentDir});
          const savedFile = await newFile.save() 
          savedFile.dataValues.type = 'file'
          data.push(savedFile);
        }
      } else if (fileType == "folder") {
        if (type === "MOVE") {
          await Dir.update(
            { parent_dir: parentDir },
            { where: { id, owner_id: ownerId } }
          );
        } else if (type === "COPY") {
          const existingDir = await Dir.findOne({
            where: { id, owner_id: ownerId },
          });
          if (!existingDir) continue;
          const newDir = await Dir.build({ ...existingDir.get(), id: null,parent_dir : parentDir });
          const savedDir = await newDir.save();
          savedDir.dataValues.type='folder'
          data.push(savedDir);
          await recursionCopy(existingDir.id, savedDir.id);
        }
      }
    }
    return res.status(STATUS_CODES.GOOD).json({ success: "true", data });
  } catch (error) {
    res
      .status(STATUS_CODES.SEVERERR)
      .json({ message: error.message, success: false });
  }
});
router.post("/rename", async (req, res) => {
  try {
    //{file, type, parentDir :thunkAPI.getState().fileManager.parentId }
    let { file, ownerId = 1, newName } = req.body;
    let data = [];

    let { type: fileType, id, objectKey } = file;
    if (fileType == "file") {
      await File.update(
        { name: newName },
        { where: { id, object_key: objectKey, owner_id: ownerId } }
      );
    } else if (fileType == "folder") {
      await Dir.update({ name: newName }, { where: { id, owner_id: ownerId } });
    }

    return res.status(STATUS_CODES.GOOD).json({ success: "true", data });
  } catch (error) {
    res
      .status(STATUS_CODES.SEVERERR)
      .json({ message: error.message, success: false });
  }
});

//files  id parent_id
//      10 1
//

//folder id parent_id

async function recursionCopy(oldId, newId) {
  //for dirs

  const dirs = await Dir.findAll({ where: { parent_dir: oldId } });
  for (let dir of dirs) {
    const newDir = await Dir.build({
      ...dir.get(),
      id: null,
      parent_dir: newId,
    });
    const savedDir = await newDir.save();
    recursionCopy(dir.id, savedDir.id);
  }

  const files = await File.findAll({ where: { parent_dir: oldId } });
  for (let file of files) {
    const newFile = await File.build({ ...file.get(), id: null , parent_dir : newId});
    await newFile.save();
  }
  //for files
}


async function recursionDelete(id) {
  const dirs = await Dir.findAll({where : {parent_dir : id}});
  for(let dir of dirs){
    recursionDelete(dir.id);
    await dir.destroy()
  }
  const files = await File.findAll({where : {parent_dir : id}});
  for (let file of files) {
    await file.destroy()
  }
}

module.exports = router;
