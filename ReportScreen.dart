import 'package:drop_down_list/model/selected_list_item.dart';
import 'package:flutter/material.dart';
import 'package:test_project/config.dart';
import 'package:test_project/models/question.dart';
import 'package:test_project/models/syncItem.dart';
import 'package:test_project/providers/QueryModel.dart';
import 'package:test_project/providers/QueryTypeModel.dart';
import 'package:test_project/providers/SyncModel.dart';
import 'package:test_project/widgets/common/BaseScreen.dart';
import 'package:test_project/widgets/common/Button.dart';
import 'package:test_project/widgets/question/QuestionInputContainer.dart';
import 'package:test_project/widgets/common/ScreenTitle.dart';
import 'package:provider/provider.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({Key? key}) : super(key: key);

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

double check(int index, int queryLength) {
  dynamic val = ((index + 1) / queryLength);
  if (val.isInfinite || val.isNaN) {
    return 0.0;
  }
  return val;
}

class _ReportScreenState extends State<ReportScreen> {
  final TextEditingController searchTextEditingController =
      TextEditingController();
  final TextEditingController controller = TextEditingController();
  int index = 0;
  var config = Config();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final scrollController = ScrollController();
    QueryTypeModel queryType =
        Provider.of<QueryTypeModel>(context, listen: false);
    QueryModel query = Provider.of<QueryModel>(context);
    SyncModel sync = Provider.of<SyncModel>(context, listen: false);

    var ids = query.queryTypeMap(queryType.selectedType).keys.toList();
    List<GlobalKey> _keyList =
        List<GlobalKey>.generate(ids.length, (i) => GlobalKey());

    @override
    void dispose() {
      scrollController.dispose();
      searchTextEditingController.dispose();
      super.dispose();
    }

    handleChange(String id, String value) {
      query.updateQuery(queryType.selectedType ?? '', id, value);
    }

    handleSearchPickerChange(String id, SelectedListItem item) {
      query.updateQueryWithList(queryType.selectedType ?? '', id, item);
    }

    return BaseScreen(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const ScreenTitle(
              label: 'Report side effect',
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 32),
              child: Container(
                decoration: const BoxDecoration(boxShadow: [
                  BoxShadow(
                    offset: Offset(0, 0),
                    spreadRadius: 0,
                    blurRadius: 4,
                    color: Color.fromRGBO(255, 255, 255, 0.5),
                  )
                ]),
                child: ClipRRect(
                  borderRadius: const BorderRadius.all(Radius.circular(10)),
                  child: LinearProgressIndicator(
                    value: check(index, ids.length),
                    minHeight: 8,
                  ),
                ),
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                  builder: (BuildContext context, BoxConstraints constraints) {
                return Container(
                    margin: const EdgeInsets.symmetric(vertical: 20.0),
                    height: constraints.maxHeight,
                    child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                                color: Colors.black12,
                                blurRadius: 30,
                                blurStyle: BlurStyle.normal)
                          ],
                        ),
                        child: ListView.builder(
                            physics: const NeverScrollableScrollPhysics(),
                            scrollDirection: Axis.horizontal,
                            controller: scrollController,
                            shrinkWrap: false,
                            itemCount: ids.length,
                            itemBuilder: (BuildContext context, int idx) {
                              var item = query.queryTypeMap(
                                  queryType.selectedType)[ids[idx]] as Question;
                              return QuestionInputContainer(
                                  key: _keyList[idx],
                                  width: constraints.maxWidth,
                                  id: ids[idx],
                                  label: item.label,
                                  index: idx,
                                  optionType: item.optionType,
                                  onChange: handleChange,
                                  onSearchPickerChange:
                                      handleSearchPickerChange,
                                  options: item.options,
                                  value: item.selectedItem,
                                  values: item.selectedListItems,
                                  multi: item.multi,
                                  controller: controller);
                            })));
              }),
            ),
            Container(
              alignment: Alignment.bottomCenter,
              padding: const EdgeInsets.only(top: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Button(
                    label: "Back",
                    onPressed: index > 0
                        ? () {
                            var newIndex = index - 1;
                            scrollController.position.ensureVisible(
                              _keyList[newIndex]
                                  .currentContext!
                                  .findRenderObject()!,
                              alignment: 0,
                              duration: const Duration(seconds: 1),
                            );

                            setState(() {
                              index = newIndex;
                            });
                          }
                        : null,
                  ),
                  Button(
                    label: "Next",
                    onPressed: index < ids.length - 1
                        ? (query.queryTypeMap(queryType.selectedType)[
                                            ids[index]] as Question)
                                        .selectedItem !=
                                    null ||
                                (query.queryTypeMap(
                                            queryType.selectedType)[ids[index]]
                                        as Question)
                                    .selectedListItems!
                                    .isNotEmpty
                            ? () {
                                var newIndex = index + 1;
                                scrollController.position.ensureVisible(
                                  _keyList[newIndex]
                                      .currentContext!
                                      .findRenderObject()!,
                                  alignment: 0,
                                  duration: const Duration(seconds: 1),
                                );
                                controller.clear();
                                setState(() {
                                  index = newIndex;
                                });
                              }
                            : null
                        : () {
                            var syncItems = {
                              '0': SyncItem(
                                  '0',
                                  queryType.selectedTypeMap['label'],
                                  queryType.selectedTypeMap['label'],
                                  0,
                                  true),
                            };

                            (query.queryTypeMap(queryType.selectedType))
                                .values
                                .forEach((element) {
                              if (element.selectedItem != null ||
                                  element.selectedListItems != []) {
                                syncItems[element.id] = SyncItem(element.id,
                                    element.label, element.label, 1, true);
                              }
                            });

                            sync.updateSyncMapType(
                                queryType.selectedType ?? '', syncItems);

                            Navigator.pushNamed(
                                context, '/reportSideEffectSuccess');
                          },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
